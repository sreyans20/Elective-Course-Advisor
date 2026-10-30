export type ElectiveType = 'Professional Elective' | 'Open Elective' | 'Department Elective';

export type WorkloadPreference = 'Low' | 'Moderate' | 'High';

export interface TimetableSlot {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  startHour: number; // 24-hr format, e.g. 10 for 10:00
  endHour: number;   // e.g. 11 for 11:00
  raw: string;       // e.g. "Mon 10:00-11:00"
}

export interface Elective {
  id: string;             // e.g. "CS401"
  name: string;           // e.g. "Machine Learning"
  type: ElectiveType;     // "Professional Elective" | "Open Elective"
  timetableSlot: string;  // e.g. "Mon 10:00-11:00" or "Mon 10:00-11:00, Wed 10:00-11:00"
  slots: TimetableSlot[]; // parsed slot objects for conflict detection
  prerequisites: string[];// array of prerequisite subject names, e.g. ["Python", "Data Structures"]
  difficulty: number;     // 1 to 5
  weeklyHours: number;    // expected hours per week
  careerTags: string[];   // e.g. ["Artificial Intelligence", "Data Science"]
  skillTags: string[];    // e.g. ["Python", "Machine Learning", "Scikit-Learn"]
  description?: string;
  department?: string;
}

export interface RequiredElectiveCount {
  [type: string]: number; // e.g. { "Professional Elective": 2, "Open Elective": 1 }
}

export interface Student {
  id: string;                       // e.g. "STU101"
  name: string;                     // e.g. "Rahul Sharma"
  goal: string;                     // e.g. "AI Engineer"
  cgpa: number;                     // e.g. 8.2
  subjectsCleared: string[];        // e.g. ["Python", "Mathematics", "Statistics"]
  weakSubjects: string[];           // e.g. ["Mathematics"]
  workloadPreference: WorkloadPreference; // "Low" | "Moderate" | "High"
  requiredCounts: RequiredElectiveCount;  // parsed count requirements
  requiredRaw: string;              // raw string e.g. "2 Professional + 1 Open"
}

export interface CombinationScoreBreakdown {
  careerScore: number;       // 0 - 100
  skillScore: number;        // 0 - 100
  workloadScore: number;     // 0 - 100
  difficultyScore: number;   // 0 - 100
  weakSubjectPenalty: number;// 0 - 20
  totalScore: number;        // 0 - 100
}

export interface ScoringWeights {
  careerWeight: number;      // default 0.40
  skillWeight: number;       // default 0.25
  workloadWeight: number;    // default 0.20
  difficultyWeight: number;  // default 0.15
  weakSubjectPenaltyFactor: number; // default 5 points per weak subject hit
}

export interface RecommendedCombination {
  rank: 1 | 2 | 3;
  profileTitle: string;      // e.g. "Best Match: Direct Career Acceleration"
  profileSubtitle: string;   // e.g. "Maximum alignment with AI Engineer goals"
  electives: Elective[];
  scoreBreakdown: CombinationScoreBreakdown;
  totalWeeklyHours: number;
  averageDifficulty: number;
  benefits: string[];
  tradeoffs: string[];       // "What the student gives up"
  weakSubjectWarnings: string[];
  unmetPreferences: string[];
}

export interface ConflictDetails {
  type: 'TIMETABLE_CLASH' | 'MISSING_PREREQUISITE' | 'COUNT_MISMATCH';
  message: string;
  involvedCourses?: string[];
}

export interface CombinationValidationResult {
  isValid: boolean;
  conflicts: ConflictDetails[];
  missingPrerequisites: { courseId: string; courseName: string; missing: string[] }[];
  timetableClashes: { courseA: string; courseB: string; slot: string }[];
  countsMet: boolean;
}

export interface StudentRecommendationResult {
  student: Student;
  validCombinationsCount: number;
  totalEvaluatedCount: number;
  topRecommendations: RecommendedCombination[];
  status: 'FULLY_SATISFIED' | 'PARTIALLY_SATISFIED' | 'NO_VALID_COMBINATION';
  statusExplanation: string;
  missingPrerequisiteBlockers: string[];
  timetableConflictBlockers: string[];
}

export interface BatchEvaluationSummary {
  totalStudents: number;
  fullySatisfiedCount: number;
  partiallySatisfiedCount: number;
  noValidCombinationCount: number;
  constraintValidityRate: number; // e.g. 100%
  totalCombinationsGenerated: number;
  zeroInvalidInFinal: boolean;
  averageTopScore: number;
  studentResults: StudentRecommendationResult[];
}
