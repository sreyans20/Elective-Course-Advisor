import Papa from 'papaparse';
import { Elective, Student, ElectiveType, WorkloadPreference } from '../types';
import { parseSlotString } from '../data/defaultElectives';
import { parseRequiredCounts } from '../data/defaultStudents';
import { sanitizeText } from './security';

/**
 * Parses Electives CSV content with security sanitization
 */
export function parseElectivesCSV(csvText: string): { electives: Elective[]; errors: string[] } {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const electives: Elective[] = [];
  const errors: string[] = [];

  result.data.forEach((row: any, index: number) => {
    try {
      const id = sanitizeText(row['Course ID'] || row['ID'] || row['Code'] || `ELEC${index + 1}`);
      const name = sanitizeText(row['Name'] || row['Subject'] || row['Course Name'] || `Elective ${index + 1}`);
      const rawType = (row['Type'] || row['Category'] || 'Professional Elective').trim();
      const type: ElectiveType = rawType.toLowerCase().includes('open') ? 'Open Elective' : 'Professional Elective';

      const timetableSlot = sanitizeText(row['Timetable slot'] || row['Timetable Slot'] || row['Time'] || row['Slot'] || '');
      const slots = parseSlotString(timetableSlot);

      const rawPrereq = (row['Prerequisites'] || row['Prerequisite'] || '').trim();
      const prerequisites = rawPrereq && rawPrereq.toLowerCase() !== 'none'
        ? rawPrereq.split(/[,;]/).map((s: string) => sanitizeText(s)).filter(Boolean)
        : [];

      const difficulty = Math.max(1, Math.min(5, parseInt(row['Difficulty'] || '3', 10) || 3));
      const weeklyHours = Math.max(1, parseInt(row['Weekly hours'] || row['Weekly Hours'] || row['Hours'] || '3', 10) || 3);

      const rawCareers = (row['Career tags'] || row['Career Tags'] || row['Careers'] || '').trim();
      const careerTags = rawCareers ? rawCareers.split(/[,;]/).map((s: string) => sanitizeText(s)).filter(Boolean) : [];

      const rawSkills = (row['Skill tags'] || row['Skill Tags'] || row['Skills'] || '').trim();
      const skillTags = rawSkills ? rawSkills.split(/[,;]/).map((s: string) => sanitizeText(s)).filter(Boolean) : [];

      const description = sanitizeText(row['Description'] || '');
      const department = sanitizeText(row['Department'] || (type === 'Open Elective' ? 'Interdisciplinary' : 'Computer Science'));

      electives.push({
        id,
        name,
        type,
        timetableSlot,
        slots,
        prerequisites,
        difficulty,
        weeklyHours,
        careerTags,
        skillTags,
        description,
        department
      });
    } catch (e: any) {
      errors.push(`Row ${index + 1}: ${e.message}`);
    }
  });

  return { electives, errors };
}

/**
 * Parses Students CSV content with security sanitization
 */
export function parseStudentsCSV(csvText: string): { students: Student[]; errors: string[] } {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const students: Student[] = [];
  const errors: string[] = [];

  result.data.forEach((row: any, index: number) => {
    try {
      const id = sanitizeText(row['Student ID'] || row['ID'] || `STU${index + 1}`);
      const name = sanitizeText(row['Name'] || row['Student Name'] || `Student ${index + 1}`);
      const goal = sanitizeText(row['Goal'] || row['Career Goal'] || 'AI Engineer');
      const cgpa = Math.max(0, Math.min(10, parseFloat(row['CGPA'] || '7.5') || 7.5));

      const rawCleared = (row['Subjects cleared'] || row['Subjects Cleared'] || row['Cleared Subjects'] || '').trim();
      const subjectsCleared = rawCleared && rawCleared.toLowerCase() !== 'none'
        ? rawCleared.split(/[,;]/).map((s: string) => sanitizeText(s)).filter(Boolean)
        : [];

      const rawWeak = (row['Weak subjects'] || row['Weak Subjects'] || '').trim();
      const weakSubjects = rawWeak && rawWeak.toLowerCase() !== 'none'
        ? rawWeak.split(/[,;]/).map((s: string) => sanitizeText(s)).filter(Boolean)
        : [];

      const rawPref = (row['Workload preference'] || row['Workload Preference'] || 'Moderate').trim();
      let workloadPreference: WorkloadPreference = 'Moderate';
      if (rawPref.toLowerCase().includes('low')) workloadPreference = 'Low';
      else if (rawPref.toLowerCase().includes('high')) workloadPreference = 'High';

      const rawReq = sanitizeText(row['Number of electives of each type required'] || row['Required Electives'] || '2 Professional + 1 Open');
      const requiredCounts = parseRequiredCounts(rawReq);

      students.push({
        id,
        name,
        goal,
        cgpa,
        subjectsCleared,
        weakSubjects,
        workloadPreference,
        requiredCounts,
        requiredRaw: rawReq
      });
    } catch (e: any) {
      errors.push(`Row ${index + 1}: ${e.message}`);
    }
  });

  return { students, errors };
}

/**
 * Generates sample CSV strings for download
 */
export function generateElectivesCSVTemplate(electives: Elective[]): string {
  const rows = electives.map(e => ({
    'Course ID': e.id,
    'Name': e.name,
    'Type': e.type,
    'Timetable slot': e.timetableSlot,
    'Prerequisites': e.prerequisites.join(', '),
    'Difficulty': e.difficulty,
    'Weekly hours': e.weeklyHours,
    'Career tags': e.careerTags.join(', '),
    'Skill tags': e.skillTags.join(', '),
    'Description': e.description || ''
  }));
  return Papa.unparse(rows);
}

export function generateStudentsCSVTemplate(students: Student[]): string {
  const rows = students.map(s => ({
    'Student ID': s.id,
    'Name': s.name,
    'Goal': s.goal,
    'CGPA': s.cgpa,
    'Subjects cleared': s.subjectsCleared.join(', '),
    'Weak subjects': s.weakSubjects.join(', '),
    'Workload preference': s.workloadPreference,
    'Number of electives of each type required': s.requiredRaw
  }));
  return Papa.unparse(rows);
}
