import { Student, Elective, ScoringWeights, BatchEvaluationSummary, StudentRecommendationResult } from '../types';
import { getRecommendationsForStudent, DEFAULT_WEIGHTS } from './recommendationEngine';
import { validateCombination } from './constraintSolver';

/**
 * Runs batch evaluation over all students and verifies 100% constraint validity
 */
export function runBatchEvaluation(
  students: Student[],
  electives: Elective[],
  weights: ScoringWeights = DEFAULT_WEIGHTS
): BatchEvaluationSummary {
  const studentResults: StudentRecommendationResult[] = [];
  let fullySatisfiedCount = 0;
  let partiallySatisfiedCount = 0;
  let noValidCombinationCount = 0;
  let totalCombsGenerated = 0;
  let totalScoreSum = 0;
  let scoreCount = 0;

  // Strict constraint check counters
  let totalRecommendedChecked = 0;
  let invalidCombinationsFound = 0;

  for (const student of students) {
    const res = getRecommendationsForStudent(student, electives, weights);
    studentResults.push(res);

    if (res.status === 'FULLY_SATISFIED') {
      fullySatisfiedCount++;
    } else if (res.status === 'PARTIALLY_SATISFIED') {
      partiallySatisfiedCount++;
    } else {
      noValidCombinationCount++;
    }

    totalCombsGenerated += res.topRecommendations.length;

    // Verify hard constraints on every single recommendation produced!
    for (const rec of res.topRecommendations) {
      totalRecommendedChecked++;
      const val = validateCombination(rec.electives, student);
      if (!val.isValid) {
        invalidCombinationsFound++;
      }
    }

    if (res.topRecommendations.length > 0) {
      totalScoreSum += res.topRecommendations[0].scoreBreakdown.totalScore;
      scoreCount++;
    }
  }

  const constraintValidityRate = totalRecommendedChecked > 0
    ? Math.round(((totalRecommendedChecked - invalidCombinationsFound) / totalRecommendedChecked) * 1000) / 10
    : 100;

  return {
    totalStudents: students.length,
    fullySatisfiedCount,
    partiallySatisfiedCount,
    noValidCombinationCount,
    constraintValidityRate,
    totalCombinationsGenerated: totalCombsGenerated,
    zeroInvalidInFinal: invalidCombinationsFound === 0,
    averageTopScore: scoreCount > 0 ? Math.round((totalScoreSum / scoreCount) * 10) / 10 : 0,
    studentResults
  };
}
