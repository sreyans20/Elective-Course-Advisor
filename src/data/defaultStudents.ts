import { Student, WorkloadPreference, RequiredElectiveCount } from '../types';

export function parseRequiredCounts(reqStr: string): RequiredElectiveCount {
  const result: RequiredElectiveCount = {};
  if (!reqStr) return { 'Professional Elective': 2, 'Open Elective': 1 };

  // e.g. "2 Professional + 1 Open" or "2 Professional, 1 Open" or "3 Professional"
  const parts = reqStr.split(/[+,&]/).map(p => p.trim());
  for (const part of parts) {
    const match = part.match(/(\d+)\s*(Professional|Open|Department)?/i);
    if (match) {
      const count = parseInt(match[1], 10);
      const typeStr = (match[2] || '').toLowerCase();
      if (typeStr.includes('open')) {
        result['Open Elective'] = count;
      } else if (typeStr.includes('dept') || typeStr.includes('department')) {
        result['Department Elective'] = count;
      } else {
        result['Professional Elective'] = count;
      }
    }
  }

  // Fallback if empty
  if (Object.keys(result).length === 0) {
    result['Professional Elective'] = 2;
    result['Open Elective'] = 1;
  }
  return result;
}

const FIRST_NAMES = [
  'Rahul', 'Priya', 'Aarav', 'Ananya', 'Rohan', 'Sneha', 'Vikram', 'Pooja', 'Aditya', 'Ishita',
  'Arjun', 'Divya', 'Siddharth', 'Meera', 'Karan', 'Riya', 'Nikhil', 'Tanvi', 'Varun', 'Kavya',
  'Harsh', 'Shreya', 'Manish', 'Neha', 'Gaurav', 'Swati', 'Akash', 'Bhavna', 'Deepak', 'Nandini'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Verma', 'Iyer', 'Reddy', 'Gupta', 'Singh', 'Nair', 'Chopra', 'Mehta',
  'Bose', 'Das', 'Kulkarni', 'Deshmukh', 'Joshi', 'Menon', 'Rao', 'Bhat', 'Agarwal', 'Kapoor'
];

const GOALS = [
  'AI Engineer',
  'Data Scientist',
  'Cloud Architect',
  'Full Stack Developer',
  'Cybersecurity Analyst',
  'Product Manager',
  'Systems / Embedded Engineer'
];

const ALL_POSSIBLE_CLEARED = [
  'Python', 'Mathematics', 'Statistics', 'Data Structures', 'Operating Systems',
  'Computer Networks', 'Database Systems', 'Theory of Computation', 'Machine Learning',
  'Electronics', 'Cryptography'
];

export function generateBenchmarkStudents(): Student[] {
  const students: Student[] = [];

  // 1. Handcrafted benchmark student 1 (The famous "Rahul" from the problem statement breakdown!)
  students.push({
    id: 'STU101',
    name: 'Rahul Sharma',
    goal: 'AI Engineer',
    cgpa: 8.2,
    subjectsCleared: ['Python', 'Mathematics', 'Statistics', 'Data Structures'],
    weakSubjects: ['Electronics'],
    workloadPreference: 'Moderate',
    requiredCounts: { 'Professional Elective': 2, 'Open Elective': 1 },
    requiredRaw: '2 Professional + 1 Open'
  });

  // 2. Handcrafted benchmark student 2 (Priya - Missing AI prerequisites, wants AI)
  // Requirement 4 Edge Case: Valid combination exists, but preferences cannot all be fully satisfied!
  students.push({
    id: 'STU102',
    name: 'Priya Patel',
    goal: 'AI Engineer',
    cgpa: 7.4,
    subjectsCleared: ['Data Structures', 'Operating Systems', 'Computer Networks'], // Neither Python nor Math cleared!
    weakSubjects: ['Mathematics'],
    workloadPreference: 'Low',
    requiredCounts: { 'Professional Elective': 2, 'Open Elective': 1 },
    requiredRaw: '2 Professional + 1 Open'
  });

  // 3. Handcrafted benchmark student 3 (Impossible edge case: No valid combination exists)
  // Needs 2 Professional electives, but has cleared NO prerequisites whatsoever.
  students.push({
    id: 'STU103',
    name: 'Aarav Verma (Edge Case - Blocked)',
    goal: 'AI Engineer',
    cgpa: 5.6,
    subjectsCleared: [], // No cleared subjects
    weakSubjects: ['Mathematics', 'Python'],
    workloadPreference: 'Low',
    requiredCounts: { 'Professional Elective': 2, 'Open Elective': 1 },
    requiredRaw: '2 Professional + 1 Open'
  });

  // 4. Handcrafted benchmark student 4 (High Achiever Cloud Architect)
  students.push({
    id: 'STU104',
    name: 'Ananya Iyer',
    goal: 'Cloud Architect',
    cgpa: 9.3,
    subjectsCleared: ['Operating Systems', 'Computer Networks', 'Data Structures', 'Python', 'Database Systems'],
    weakSubjects: [],
    workloadPreference: 'High',
    requiredCounts: { 'Professional Elective': 2, 'Open Elective': 1 },
    requiredRaw: '2 Professional + 1 Open'
  });

  // 5. Handcrafted benchmark student 5 (Product Manager - wants Open Elective focus)
  students.push({
    id: 'STU105',
    name: 'Rohan Gupta',
    goal: 'Product Manager',
    cgpa: 8.0,
    subjectsCleared: ['Python', 'Data Structures', 'Database Systems'],
    weakSubjects: ['Theory of Computation'],
    workloadPreference: 'Moderate',
    requiredCounts: { 'Professional Elective': 1, 'Open Elective': 2 },
    requiredRaw: '1 Professional + 2 Open'
  });

  // 6. Handcrafted benchmark student 6 (Cybersecurity specialist)
  students.push({
    id: 'STU106',
    name: 'Sneha Reddy',
    goal: 'Cybersecurity Analyst',
    cgpa: 8.6,
    subjectsCleared: ['Computer Networks', 'Operating Systems', 'Mathematics', 'Data Structures'],
    weakSubjects: [],
    workloadPreference: 'Moderate',
    requiredCounts: { 'Professional Elective': 2, 'Open Elective': 1 },
    requiredRaw: '2 Professional + 1 Open'
  });

  // Generate students 7 to 100 with deterministic seeded variety
  for (let i = 7; i <= 100; i++) {
    const stuId = `STU${100 + i}`;
    const firstName = FIRST_NAMES[(i * 7 + 3) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 11 + 5) % LAST_NAMES.length];
    const goal = GOALS[(i * 13 + 2) % GOALS.length];
    
    // CGPA between 5.5 and 9.8
    const cgpa = Math.round((5.5 + ((i * 17) % 43) * 0.1) * 10) / 10;
    
    // Workload preference
    const workloadPref: WorkloadPreference = (i % 5 === 0) ? 'Low' : (i % 3 === 0) ? 'High' : 'Moderate';
    
    // Number of cleared subjects (between 2 and 7)
    const numCleared = 2 + ((i * 5) % 6);
    const cleared: string[] = [];
    for (let c = 0; c < numCleared; c++) {
      const subject = ALL_POSSIBLE_CLEARED[(i + c * 3) % ALL_POSSIBLE_CLEARED.length];
      if (!cleared.includes(subject)) {
        cleared.push(subject);
      }
    }

    // Weak subjects
    const weakSubjects: string[] = [];
    if (i % 4 === 0) {
      weakSubjects.push('Mathematics');
    }
    if (i % 7 === 0) {
      weakSubjects.push('Electronics');
    }

    // Elective requirement pattern
    let reqRaw = '2 Professional + 1 Open';
    let reqCounts: RequiredElectiveCount = { 'Professional Elective': 2, 'Open Elective': 1 };
    if (i % 12 === 0) {
      reqRaw = '3 Professional';
      reqCounts = { 'Professional Elective': 3 };
    } else if (i % 15 === 0) {
      reqRaw = '1 Professional + 2 Open';
      reqCounts = { 'Professional Elective': 1, 'Open Elective': 2 };
    }

    // Intentional edge case injection for testing Requirement 4 & 5
    if (i === 42) {
      // Missing all professional prerequisites
      students.push({
        id: stuId,
        name: `${firstName} ${lastName} (Prereq Bottleneck)`,
        goal: 'AI Engineer',
        cgpa: 6.2,
        subjectsCleared: [], // Empty cleared
        weakSubjects: ['Mathematics'],
        workloadPreference: 'Low',
        requiredCounts: { 'Professional Elective': 2, 'Open Elective': 1 },
        requiredRaw: '2 Professional + 1 Open'
      });
      continue;
    }

    students.push({
      id: stuId,
      name: `${firstName} ${lastName}`,
      goal,
      cgpa,
      subjectsCleared: cleared,
      weakSubjects,
      workloadPreference: workloadPref,
      requiredCounts: reqCounts,
      requiredRaw: reqRaw
    });
  }

  return students;
}

export const DEFAULT_STUDENTS: Student[] = generateBenchmarkStudents();
