import { Elective, Student, TimetableSlot, CombinationValidationResult } from '../types';

/**
 * Checks if two timetable slots overlap in time
 */
export function doSlotsOverlap(slotA: TimetableSlot, slotB: TimetableSlot): boolean {
  if (slotA.day !== slotB.day) {
    return false;
  }
  // Intersecting interval: max(startA, startB) < min(endA, endB)
  const latestStart = Math.max(slotA.startHour, slotB.startHour);
  const earliestEnd = Math.min(slotA.endHour, slotB.endHour);
  return latestStart < earliestEnd;
}

/**
 * Checks if two electives have any timetable clash
 */
export function checkElectiveClash(
  courseA: Elective,
  courseB: Elective
): { hasClash: boolean; conflictingSlot?: string } {
  // If either has no slots defined, no clash
  if (!courseA.slots.length || !courseB.slots.length) {
    // If identical non-empty raw string
    if (courseA.timetableSlot && courseB.timetableSlot && courseA.timetableSlot.toLowerCase() === courseB.timetableSlot.toLowerCase()) {
      return { hasClash: true, conflictingSlot: courseA.timetableSlot };
    }
    return { hasClash: false };
  }

  for (const slotA of courseA.slots) {
    for (const slotB of courseB.slots) {
      if (doSlotsOverlap(slotA, slotB)) {
        return {
          hasClash: true,
          conflictingSlot: `${slotA.day} ${slotA.startHour}:00-${slotA.endHour}:00 vs ${slotB.startHour}:00-${slotB.endHour}:00`
        };
      }
    }
  }

  return { hasClash: false };
}

/**
 * Validates whether a student is individually eligible for a given elective
 */
export function checkStudentPrerequisites(
  student: Student,
  elective: Elective
): { isEligible: boolean; missingPrerequisites: string[] } {
  if (!elective.prerequisites || elective.prerequisites.length === 0) {
    return { isEligible: true, missingPrerequisites: [] };
  }

  const clearedSet = new Set(student.subjectsCleared.map(s => s.toLowerCase().trim()));
  const missing: string[] = [];

  for (const prereq of elective.prerequisites) {
    const norm = prereq.toLowerCase().trim();
    if (!clearedSet.has(norm)) {
      missing.push(prereq);
    }
  }

  return {
    isEligible: missing.length === 0,
    missingPrerequisites: missing
  };
}

/**
 * Validates an entire combination of electives against:
 * 1. Prerequisite eligibility for the student
 * 2. Mutual timetable conflict detection between all pairs
 * 3. Required elective type quota counts
 */
export function validateCombination(
  combination: Elective[],
  student: Student
): CombinationValidationResult {
  const result: CombinationValidationResult = {
    isValid: true,
    conflicts: [],
    missingPrerequisites: [],
    timetableClashes: [],
    countsMet: true
  };

  // 1. Check Prerequisites for each course in the combination
  for (const course of combination) {
    const prereqCheck = checkStudentPrerequisites(student, course);
    if (!prereqCheck.isEligible) {
      result.isValid = false;
      result.missingPrerequisites.push({
        courseId: course.id,
        courseName: course.name,
        missing: prereqCheck.missingPrerequisites
      });
      result.conflicts.push({
        type: 'MISSING_PREREQUISITE',
        message: `${course.name} requires prerequisite: ${prereqCheck.missingPrerequisites.join(', ')}`,
        involvedCourses: [course.name]
      });
    }
  }

  // 2. Check Timetable Clashes between all pairs
  for (let i = 0; i < combination.length; i++) {
    for (let j = i + 1; j < combination.length; j++) {
      const courseA = combination[i];
      const courseB = combination[j];
      const clash = checkElectiveClash(courseA, courseB);
      if (clash.hasClash) {
        result.isValid = false;
        result.timetableClashes.push({
          courseA: courseA.name,
          courseB: courseB.name,
          slot: clash.conflictingSlot || courseA.timetableSlot
        });
        result.conflicts.push({
          type: 'TIMETABLE_CLASH',
          message: `Schedule conflict between "${courseA.name}" and "${courseB.name}" (${clash.conflictingSlot || courseA.timetableSlot})`,
          involvedCourses: [courseA.name, courseB.name]
        });
      }
    }
  }

  // 3. Check Elective Type Quota
  const typeCounts: Record<string, number> = {};
  for (const course of combination) {
    typeCounts[course.type] = (typeCounts[course.type] || 0) + 1;
  }

  for (const [requiredType, expectedCount] of Object.entries(student.requiredCounts)) {
    const actualCount = typeCounts[requiredType] || 0;
    if (actualCount !== expectedCount) {
      result.isValid = false;
      result.countsMet = false;
      result.conflicts.push({
        type: 'COUNT_MISMATCH',
        message: `Requires ${expectedCount} ${requiredType}(s), but combination contains ${actualCount}.`
      });
    }
  }

  return result;
}
