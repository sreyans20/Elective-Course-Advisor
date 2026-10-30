import {
  Elective,
  Student,
  RecommendedCombination,
  CombinationScoreBreakdown,
  ScoringWeights,
  StudentRecommendationResult
} from '../types';
import { checkStudentPrerequisites, checkElectiveClash, validateCombination } from './constraintSolver';
import { calculateCareerMatchScore } from '../data/careerTaxonomy';
import { generateBenefits, generateTradeoffs, diagnoseUnmetPreferences } from './explanationEngine';

export const DEFAULT_WEIGHTS: ScoringWeights = {
  careerWeight: 0.40,
  skillWeight: 0.25,
  workloadWeight: 0.20,
  difficultyWeight: 0.15,
  weakSubjectPenaltyFactor: 5
};

/**
 * Generates all combinations of size k from an array
 */
function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const head = arr[0];
  const tail = arr.slice(1);
  const withHead = getCombinations(tail, k - 1).map(comb => [head, ...comb]);
  const withoutHead = getCombinations(tail, k);
  return [...withHead, ...withoutHead];
}

/**
 * Calculates Workload Suitability Score (0 to 100)
 * Low pref: Ideal 8-10 hrs (score 100). Higher hours penalized.
 * Moderate pref: Ideal 11-13 hrs (score 100).
 * High pref: Ideal 13-16 hrs (score 100). Lower hours penalized.
 */
export function calculateWorkloadScore(totalHours: number, preference: Student['workloadPreference']): number {
  switch (preference) {
    case 'Low':
      if (totalHours <= 9) return 100;
      if (totalHours <= 11) return 85;
      if (totalHours <= 13) return 60;
      return Math.max(20, 100 - (totalHours - 9) * 15);
    case 'Moderate':
      if (totalHours >= 10 && totalHours <= 13) return 100;
      if (totalHours === 9 || totalHours === 14) return 85;
      if (totalHours === 8 || totalHours === 15) return 70;
      return Math.max(30, 100 - Math.abs(totalHours - 12) * 12);
    case 'High':
      if (totalHours >= 13) return 100;
      if (totalHours >= 11) return 85;
      if (totalHours >= 9) return 65;
      return Math.max(30, 100 - (13 - totalHours) * 15);
  }
}

/**
 * Calculates Difficulty Suitability Score (0 to 100)
 * Combined with student CGPA and workload preference.
 */
export function calculateDifficultyScore(
  avgDifficulty: number,
  cgpa: number,
  workloadPref: Student['workloadPreference']
): number {
  // If low workload or low CGPA, prefer moderate/easy courses (difficulty 2.0 to 3.2)
  // If high CGPA and high workload, higher difficulty (3.5 to 4.5) is rewarded
  let idealDifficulty = 3.0;
  if (cgpa >= 8.5 && workloadPref === 'High') {
    idealDifficulty = 4.2;
  } else if (cgpa >= 8.0) {
    idealDifficulty = 3.5;
  } else if (cgpa < 7.0 || workloadPref === 'Low') {
    idealDifficulty = 2.5;
  }

  const diffDelta = Math.abs(avgDifficulty - idealDifficulty);
  return Math.max(30, Math.round(100 - diffDelta * 28));
}

/**
 * Evaluates and scores a single valid combination
 */
export function scoreCombination(
  combination: Elective[],
  student: Student,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): CombinationScoreBreakdown {
  // 1. Career Goal Score
  let careerScoreAcc = 0;
  for (const course of combination) {
    const match = calculateCareerMatchScore(course.careerTags, course.skillTags, student.goal);
    careerScoreAcc += match.score;
  }
  const careerScore = Math.min(100, Math.round(careerScoreAcc / combination.length * 1.3));

  // 2. Skill Diversity & Overlap Score
  const uniqueSkills = new Set(combination.flatMap(c => c.skillTags));
  // Reward unique applicable skills
  const skillScore = Math.min(100, uniqueSkills.size * 10);

  // 3. Workload Score
  const totalHours = combination.reduce((sum, c) => sum + c.weeklyHours, 0);
  const workloadScore = calculateWorkloadScore(totalHours, student.workloadPreference);

  // 4. Difficulty Score
  const avgDiff = combination.reduce((sum, c) => sum + c.difficulty, 0) / combination.length;
  const difficultyScore = calculateDifficultyScore(avgDiff, student.cgpa, student.workloadPreference);

  // 5. Weak subject penalty
  let weakSubjectPenalty = 0;
  if (student.weakSubjects && student.weakSubjects.length > 0) {
    for (const weak of student.weakSubjects) {
      const weakNorm = weak.toLowerCase().trim();
      const hits = combination.filter(c =>
        c.prerequisites.some(p => p.toLowerCase().includes(weakNorm)) ||
        c.skillTags.some(s => s.toLowerCase().includes(weakNorm))
      );
      weakSubjectPenalty += hits.length * weights.weakSubjectPenaltyFactor;
    }
  }

  // Final weighted total
  const rawTotal = (
    careerScore * weights.careerWeight +
    skillScore * weights.skillWeight +
    workloadScore * weights.workloadWeight +
    difficultyScore * weights.difficultyWeight -
    weakSubjectPenalty
  );

  const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal * 10) / 10));

  return {
    careerScore,
    skillScore,
    workloadScore,
    difficultyScore,
    weakSubjectPenalty,
    totalScore
  };
}

/**
 * Recommends the top 3 combinations for a student
 */
export function getRecommendationsForStudent(
  student: Student,
  allElectives: Elective[],
  weights: ScoringWeights = DEFAULT_WEIGHTS
): StudentRecommendationResult {
  // 1. Identify individually eligible electives by type (Hard Constraint: Prerequisites)
  const eligibleByType: Record<string, Elective[]> = {};
  const missingPrereqsList: string[] = [];

  for (const elective of allElectives) {
    const prereqCheck = checkStudentPrerequisites(student, elective);
    if (prereqCheck.isEligible) {
      if (!eligibleByType[elective.type]) {
        eligibleByType[elective.type] = [];
      }
      eligibleByType[elective.type].push(elective);
    } else {
      missingPrereqsList.push(...prereqCheck.missingPrerequisites);
    }
  }

  // 2. Generate combinations adhering to required elective type counts
  // e.g. 2 Professional + 1 Open
  let combinationPools: Elective[][] = [[]];

  for (const [reqType, count] of Object.entries(student.requiredCounts)) {
    const available = eligibleByType[reqType] || [];
    if (available.length < count) {
      // Cannot satisfy required count for this type!
      combinationPools = [];
      break;
    }
    const typeCombs = getCombinations(available, count);
    const newPools: Elective[][] = [];
    for (const existing of combinationPools) {
      for (const tc of typeCombs) {
        newPools.push([...existing, ...tc]);
      }
    }
    combinationPools = newPools;
  }

  const totalEvaluated = combinationPools.length;

  // 3. Filter out Timetable Clashes (Hard Constraint: Timetable Slots)
  const validCombinations: { combination: Elective[]; breakdown: CombinationScoreBreakdown }[] = [];
  const timetableClashBlockers: string[] = [];

  for (const comb of combinationPools) {
    let hasClash = false;
    for (let i = 0; i < comb.length; i++) {
      for (let j = i + 1; j < comb.length; j++) {
        const clash = checkElectiveClash(comb[i], comb[j]);
        if (clash.hasClash) {
          hasClash = true;
          timetableClashBlockers.push(`${comb[i].name} vs ${comb[j].name}`);
          break;
        }
      }
      if (hasClash) break;
    }

    if (!hasClash) {
      const breakdown = scoreCombination(comb, student, weights);
      validCombinations.push({ combination: comb, breakdown });
    }
  }

  // Sort valid combinations by descending totalScore
  validCombinations.sort((a, b) => b.breakdown.totalScore - a.breakdown.totalScore);

  // 4. Select Top 3 diverse recommendations
  const topRecommendations: RecommendedCombination[] = [];

  if (validCombinations.length > 0) {
    // Recommendation 1: Best Match (Highest Score)
    const best = validCombinations[0];
    const totalHours1 = best.combination.reduce((s, c) => s + c.weeklyHours, 0);
    const avgDiff1 = best.combination.reduce((s, c) => s + c.difficulty, 0) / best.combination.length;
    const { tradeoffs: tradeoffs1, weakSubjectWarnings: wsw1 } = generateTradeoffs(best.combination, student, allElectives, 1);

    topRecommendations.push({
      rank: 1,
      profileTitle: 'Recommendation 1: Top Career Alignment',
      profileSubtitle: `Best overall match directly targeting "${student.goal}" with high skill synergy.`,
      electives: best.combination,
      scoreBreakdown: best.breakdown,
      totalWeeklyHours: totalHours1,
      averageDifficulty: Math.round(avgDiff1 * 10) / 10,
      benefits: generateBenefits(best.combination, student, best.breakdown),
      tradeoffs: tradeoffs1,
      weakSubjectWarnings: wsw1,
      unmetPreferences: []
    });

    // Recommendation 2: Balanced / Cross-Domain Flexibility
    // Look for a combination that differs by at least 1 elective from Rec 1
    const rec1Ids = new Set(best.combination.map(c => c.id));
    let rec2Choice = validCombinations.slice(1).find(vc => {
      const diffCount = vc.combination.filter(c => !rec1Ids.has(c.id)).length;
      return diffCount >= 1;
    });

    if (!rec2Choice && validCombinations.length > 1) {
      rec2Choice = validCombinations[1];
    }

    if (rec2Choice) {
      const totalHours2 = rec2Choice.combination.reduce((s, c) => s + c.weeklyHours, 0);
      const avgDiff2 = rec2Choice.combination.reduce((s, c) => s + c.difficulty, 0) / rec2Choice.combination.length;
      const { tradeoffs: tradeoffs2, weakSubjectWarnings: wsw2 } = generateTradeoffs(rec2Choice.combination, student, allElectives, 2);

      topRecommendations.push({
        rank: 2,
        profileTitle: 'Recommendation 2: Balanced & Career Flexibility',
        profileSubtitle: 'Broader technological exposure providing versatile industry exit opportunities.',
        electives: rec2Choice.combination,
        scoreBreakdown: rec2Choice.breakdown,
        totalWeeklyHours: totalHours2,
        averageDifficulty: Math.round(avgDiff2 * 10) / 10,
        benefits: generateBenefits(rec2Choice.combination, student, rec2Choice.breakdown),
        tradeoffs: tradeoffs2,
        weakSubjectWarnings: wsw2,
        unmetPreferences: []
      });
    }

    // Recommendation 3: Workload-Optimized / Foundation & Grade Protection
    // Prefer lower hours or lower difficulty among remaining
    const usedIndices = new Set([0]);
    if (rec2Choice) {
      const idx2 = validCombinations.indexOf(rec2Choice);
      if (idx2 >= 0) usedIndices.add(idx2);
    }

    const remaining = validCombinations.filter((_, idx) => !usedIndices.has(idx));
    // Sort remaining by lowest hours or highest workload score
    remaining.sort((a, b) => b.breakdown.workloadScore - a.breakdown.workloadScore || a.breakdown.difficultyScore - b.breakdown.difficultyScore);

    const rec3Choice = remaining[0] || (validCombinations.length > 2 ? validCombinations[2] : undefined);

    if (rec3Choice) {
      const totalHours3 = rec3Choice.combination.reduce((s, c) => s + c.weeklyHours, 0);
      const avgDiff3 = rec3Choice.combination.reduce((s, c) => s + c.difficulty, 0) / rec3Choice.combination.length;
      const { tradeoffs: tradeoffs3, weakSubjectWarnings: wsw3 } = generateTradeoffs(rec3Choice.combination, student, allElectives, 3);

      topRecommendations.push({
        rank: 3,
        profileTitle: 'Recommendation 3: Workload-Optimized & Grade Safety',
        profileSubtitle: 'Designed for sustainable pacing, lower cognitive stress, and strong CGPA defense.',
        electives: rec3Choice.combination,
        scoreBreakdown: rec3Choice.breakdown,
        totalWeeklyHours: totalHours3,
        averageDifficulty: Math.round(avgDiff3 * 10) / 10,
        benefits: generateBenefits(rec3Choice.combination, student, rec3Choice.breakdown),
        tradeoffs: tradeoffs3,
        weakSubjectWarnings: wsw3,
        unmetPreferences: []
      });
    }
  }

  // 5. Diagnose Unmet Preferences & Academic Status (Requirement 4)
  const { unmet, diagnosis } = diagnoseUnmetPreferences(student, topRecommendations, allElectives);

  let status: StudentRecommendationResult['status'] = 'FULLY_SATISFIED';
  if (topRecommendations.length === 0) {
    status = 'NO_VALID_COMBINATION';
  } else if (unmet.length > 0) {
    status = 'PARTIALLY_SATISFIED';
  }

  return {
    student,
    validCombinationsCount: validCombinations.length,
    totalEvaluatedCount: totalEvaluated,
    topRecommendations,
    status,
    statusExplanation: diagnosis,
    missingPrerequisiteBlockers: Array.from(new Set(missingPrereqsList)),
    timetableConflictBlockers: Array.from(new Set(timetableClashBlockers))
  };
}
