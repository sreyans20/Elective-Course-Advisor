import { Elective, Student, RecommendedCombination, CombinationScoreBreakdown } from '../types';
import { calculateCareerMatchScore } from '../data/careerTaxonomy';

/**
 * Generates tailored benefits for a combination
 */
export function generateBenefits(
  combination: Elective[],
  student: Student,
  breakdown: CombinationScoreBreakdown
): string[] {
  const benefits: string[] = [];

  // 1. Career Goal alignment
  if (breakdown.careerScore >= 80) {
    benefits.push(`Strong direct synergy with target career goal: "${student.goal}" (${breakdown.careerScore}% alignment).`);
  } else if (breakdown.careerScore >= 50) {
    benefits.push(`Provides solid foundational exposure toward career goal: "${student.goal}".`);
  } else {
    benefits.push(`Offers versatile transferable skill-sets across high-growth tech domains.`);
  }

  // 2. Skill acquisition
  const allSkills = Array.from(new Set(combination.flatMap(c => c.skillTags)));
  const topSkills = allSkills.slice(0, 4);
  if (topSkills.length > 0) {
    benefits.push(`Builds critical practical proficiencies in: ${topSkills.join(', ')}.`);
  }

  // 3. Workload suitability
  const totalHours = combination.reduce((sum, c) => sum + c.weeklyHours, 0);
  if (student.workloadPreference === 'Low') {
    if (totalHours <= 10) {
      benefits.push(`Comfortably meets your "Low Workload" preference at only ${totalHours} hours/week, maximizing CGPA protection.`);
    } else {
      benefits.push(`Keeps academic commitment manageable at ${totalHours} hours/week.`);
    }
  } else if (student.workloadPreference === 'High') {
    benefits.push(`Rich learning intensity with ${totalHours} hours/week, ideal for rapid capability building.`);
  } else {
    benefits.push(`Well-balanced academic pacing at ${totalHours} hours/week, allowing time for projects and interview prep.`);
  }

  // 4. Prerequisite & academic standing
  benefits.push(`100% academic rule compliance: all prerequisites satisfied with zero schedule clashes.`);

  return benefits;
}

/**
 * Generates what the student gives up (Trade-offs / Sacrifices)
 */
export function generateTradeoffs(
  combination: Elective[],
  student: Student,
  allAvailableElectives: Elective[],
  rank: 1 | 2 | 3
): { tradeoffs: string[]; weakSubjectWarnings: string[] } {
  const tradeoffs: string[] = [];
  const weakSubjectWarnings: string[] = [];

  const chosenIds = new Set(combination.map(c => c.id));
  const chosenCategories = new Set(combination.flatMap(c => c.careerTags.map(t => t.toLowerCase())));
  const totalHours = combination.reduce((sum, c) => sum + c.weeklyHours, 0);
  const avgDiff = combination.reduce((sum, c) => sum + c.difficulty, 0) / combination.length;

  // 1. Weak subject overlaps
  if (student.weakSubjects && student.weakSubjects.length > 0) {
    for (const weak of student.weakSubjects) {
      const weakNorm = weak.toLowerCase().trim();
      const riskyCourses = combination.filter(c => {
        const hasWeakPrereq = c.prerequisites.some(p => p.toLowerCase().includes(weakNorm));
        const hasWeakSkill = c.skillTags.some(s => s.toLowerCase().includes(weakNorm));
        return hasWeakPrereq || hasWeakSkill;
      });

      if (riskyCourses.length > 0) {
        const warning = `Contains course(s) heavily reliant on your weak subject (${weak}): ${riskyCourses.map(c => c.name).join(', ')}. Additional self-study or tutoring recommended.`;
        weakSubjectWarnings.push(warning);
        tradeoffs.push(`Demands higher effort in your vulnerable area (${weak}) due to ${riskyCourses.map(c => c.name).join(', ')}.`);
      }
    }
  }

  // 2. Domain sacrifices (e.g. No Cloud, No Web, No AI)
  const notableDomains = [
    { tag: 'cloud', label: 'Cloud Engineering & DevOps', courses: ['CS405', 'CS406'] },
    { tag: 'full stack', label: 'Web Application & Frontend Development', courses: ['CS410', 'CS411'] },
    { tag: 'data science', label: 'Big Data & Data Analytics', courses: ['CS408', 'CS409'] },
    { tag: 'cybersecurity', label: 'Cybersecurity & Cryptography', courses: ['CS412', 'CS413'] }
  ];

  for (const domain of notableDomains) {
    const hasDomain = Array.from(chosenCategories).some(c => c.includes(domain.tag));
    if (!hasDomain && !student.goal.toLowerCase().includes(domain.tag)) {
      if (domain.tag === 'cloud' && rank === 1) {
        tradeoffs.push(`Sacrifices ${domain.label} exposure to focus deeply on primary domain courses.`);
        break;
      }
    }
  }

  // 3. Workload trade-off
  if (student.workloadPreference === 'Low' && totalHours > 10) {
    tradeoffs.push(`Weekly commitment (${totalHours} hrs) exceeds standard Low Workload threshold (≤10 hrs) due to elective depth.`);
  } else if (student.workloadPreference === 'High' && totalHours < 12) {
    tradeoffs.push(`Lighter workload (${totalHours} hrs) than preferred high-intensity capacity.`);
  }

  // 4. Difficulty trade-off
  if (avgDiff >= 4.0) {
    tradeoffs.push(`High aggregate difficulty (${avgDiff.toFixed(1)}/5.0) requires disciplined weekly milestone tracking.`);
  } else if (avgDiff <= 2.3) {
    tradeoffs.push(`Lower theoretical rigor (${avgDiff.toFixed(1)}/5.0); primarily practical rather than research-heavy.`);
  }

  // Rank-specific trade-off notes
  if (rank === 2) {
    tradeoffs.push(`Provides wider breadth across technologies but is slightly less specialized than Recommendation 1.`);
  } else if (rank === 3) {
    tradeoffs.push(`Maximizes grade safety and low cognitive strain, but defers advanced specialist electives.`);
  }

  return {
    tradeoffs: tradeoffs.slice(0, 4),
    weakSubjectWarnings
  };
}

/**
 * Checks for unmet preferences when a student's ideal profile can't be 100% matched
 */
export function diagnoseUnmetPreferences(
  student: Student,
  validCombinations: RecommendedCombination[],
  allElectives: Elective[]
): { unmet: string[]; diagnosis: string } {
  const unmet: string[] = [];
  const normalizedGoal = student.goal.toLowerCase();

  // Find electives that idealize student goal
  const dreamElectives = allElectives.filter(e => {
    return e.careerTags.some(t => t.toLowerCase().includes(normalizedGoal)) ||
           e.skillTags.some(s => normalizedGoal.includes(s.toLowerCase()));
  });

  // Check if any dream electives were blocked by missing prerequisites
  const clearedSet = new Set(student.subjectsCleared.map(s => s.toLowerCase().trim()));
  const blockedDreamElectives = dreamElectives.filter(e => {
    return e.prerequisites.some(p => !clearedSet.has(p.toLowerCase().trim()));
  });

  if (blockedDreamElectives.length > 0) {
    const missingPrereqs = Array.from(new Set(blockedDreamElectives.flatMap(e => e.prerequisites.filter(p => !clearedSet.has(p.toLowerCase().trim())))));
    unmet.push(`Cannot access top tier electives (${blockedDreamElectives.map(e => e.name).join(', ')}) because prerequisites are missing: [${missingPrereqs.join(', ')}].`);
  }

  // Check workload preference mismatch
  if (validCombinations.length > 0) {
    const bestMatchHours = validCombinations[0].totalWeeklyHours;
    if (student.workloadPreference === 'Low' && bestMatchHours > 10) {
      unmet.push(`Preferred "Low" workload could not be achieved for top domain match; best available valid combination requires ${bestMatchHours} hours/week.`);
    }
  }

  // Summary diagnosis
  let diagnosis = '';
  if (validCombinations.length === 0) {
    diagnosis = `No valid combination exists for ${student.name}. Strict academic constraints (prerequisites or timetable conflicts) prevent fulfilling the required quota (${student.requiredRaw}).`;
  } else if (unmet.length > 0) {
    diagnosis = `Valid combinations found, but some preferences could not be fully satisfied due to prerequisite gaps or workload availability. Recommended alternative paths are provided below.`;
  } else {
    diagnosis = `All academic rules and preferences successfully satisfied.`;
  }

  return { unmet, diagnosis };
}
