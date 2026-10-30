import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Navbar } from './components/Navbar';
import { StudentProfileCard } from './components/StudentAdvisor/StudentProfileCard';
import { RecommendationCard } from './components/StudentAdvisor/RecommendationCard';
import { TradeoffComparisonMatrix } from './components/StudentAdvisor/TradeoffComparisonMatrix';
import { UnmetNeedsAlert } from './components/StudentAdvisor/UnmetNeedsAlert';
import { PrerequisiteVisualizer } from './components/StudentAdvisor/PrerequisiteVisualizer';
import { ElectiveExplorer } from './components/ElectiveExplorer/ElectiveExplorer';
import { WhatIfSandbox } from './components/WhatIfSandbox/WhatIfSandbox';
import { EvaluationDashboard } from './components/EvaluationDashboard/EvaluationDashboard';
import { SettingsModal } from './components/SettingsModal/SettingsModal';
import { DEFAULT_ELECTIVES } from './data/defaultElectives';
import { DEFAULT_STUDENTS } from './data/defaultStudents';
import { DEFAULT_WEIGHTS, getRecommendationsForStudent } from './utils/recommendationEngine';
import { runBatchEvaluation } from './utils/evaluationEngine';
import { Elective, Student, ScoringWeights, RecommendedCombination } from './types';
import { Sparkles, GraduationCap } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'advisor' | 'explorer' | 'sandbox' | 'evaluation' | 'settings'>('advisor');
  const [electives, setElectives] = useState<Elective[]>(DEFAULT_ELECTIVES);
  const [students, setStudents] = useState<Student[]>(DEFAULT_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<Student>(DEFAULT_STUDENTS[0]);
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);
  const [isCustomData, setIsCustomData] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [sandboxInitialCombination, setSandboxInitialCombination] = useState<Elective[] | undefined>(undefined);

  // Live recommendations for currently selected student
  const recommendationResult = useMemo(() => {
    return getRecommendationsForStudent(selectedStudent, electives, weights);
  }, [selectedStudent, electives, weights]);

  // System-wide batch evaluation across all 100 students
  const batchEvaluation = useMemo(() => {
    return runBatchEvaluation(students, electives, weights);
  }, [students, electives, weights]);

  const handleUploadElectives = (newElectives: Elective[]) => {
    setElectives(newElectives);
    setIsCustomData(true);
  };

  const handleUploadStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    setSelectedStudent(newStudents[0]);
    setIsCustomData(true);
  };

  const handleResetBenchmark = () => {
    setElectives(DEFAULT_ELECTIVES);
    setStudents(DEFAULT_STUDENTS);
    setSelectedStudent(DEFAULT_STUDENTS[0]);
    setWeights(DEFAULT_WEIGHTS);
    setIsCustomData(false);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setSelectedStudent(updatedStudent);
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleSendToSandbox = (rec: RecommendedCombination) => {
    setSandboxInitialCombination(rec.electives);
    setActiveTab('sandbox');
  };

  const handleSelectCourseForSandbox = (elective: Elective) => {
    setSandboxInitialCombination(prev => prev ? [...prev, elective] : [elective]);
    setActiveTab('sandbox');
  };

  const handleSelectStudentFromDashboard = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab('advisor');
  };

  const handleExportEvaluationReport = () => {
    const reportData = batchEvaluation.studentResults.map(r => ({
      'Student ID': r.student.id,
      'Name': r.student.name,
      'Career Goal': r.student.goal,
      'CGPA': r.student.cgpa,
      'Required Quota': r.student.requiredRaw,
      'Recommendations Count': r.topRecommendations.length,
      'Top Match Score': r.topRecommendations[0]?.scoreBreakdown.totalScore || 0,
      'Validation Status': r.status,
      'Status Details': r.statusExplanation
    }));
    
    const csv = Papa.unparse(reportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Batch_Evaluation_Report_${batchEvaluation.totalStudents}_Students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        studentCount={students.length}
        electiveCount={electives.length}
        isCustomData={isCustomData}
        onResetData={handleResetBenchmark}
        openSettingsModal={() => setSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: STUDENT ADVISOR */}
        {activeTab === 'advisor' && (
          <div className="space-y-6">
            {/* Student Profile Card */}
            <StudentProfileCard
              students={students}
              selectedStudent={selectedStudent}
              onSelectStudent={setSelectedStudent}
              onUpdateStudent={handleUpdateStudent}
            />

            {/* Unmet Needs / Hard Constraint Alert (Requirement 4) */}
            <UnmetNeedsAlert result={recommendationResult} />

            {/* Recommendations Section Header */}
            {recommendationResult.topRecommendations.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Top 3 Elective Combinations For You
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selected from {recommendationResult.validCombinationsCount} conflict-free combinations matching your quota
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                    Requirement: {selectedStudent.requiredRaw}
                  </span>
                </div>
              </div>
            )}

            {/* Top 3 Recommendation Cards */}
            <div className="space-y-5">
              {recommendationResult.topRecommendations.map((rec) => (
                <RecommendationCard
                  key={rec.rank}
                  recommendation={rec}
                  student={selectedStudent}
                  onSendToSandbox={handleSendToSandbox}
                />
              ))}
            </div>

            {/* Side-by-Side Trade-off Comparison Matrix (Requirement 3) */}
            <TradeoffComparisonMatrix
              recommendations={recommendationResult.topRecommendations}
              student={selectedStudent}
            />

            {/* Prerequisite Eligibility & Gateway Graph */}
            <PrerequisiteVisualizer
              student={selectedStudent}
              electives={electives}
            />
          </div>
        )}

        {/* VIEW 2: ELECTIVE EXPLORER */}
        {activeTab === 'explorer' && (
          <ElectiveExplorer
            electives={electives}
            selectedStudent={selectedStudent}
            onSelectForSandbox={handleSelectCourseForSandbox}
          />
        )}

        {/* VIEW 3: WHAT-IF SANDBOX */}
        {activeTab === 'sandbox' && (
          <WhatIfSandbox
            electives={electives}
            student={selectedStudent}
            weights={weights}
            initialCombination={sandboxInitialCombination}
          />
        )}

        {/* VIEW 4: BATCH EVALUATION DASHBOARD (Requirement 5) */}
        {activeTab === 'evaluation' && (
          <EvaluationDashboard
            evaluation={batchEvaluation}
            onSelectStudent={handleSelectStudentFromDashboard}
            onExportReport={handleExportEvaluationReport}
          />
        )}
      </main>

      {/* Settings & CSV Data Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        weights={weights}
        onUpdateWeights={setWeights}
        electives={electives}
        students={students}
        onUploadElectives={handleUploadElectives}
        onUploadStudents={handleUploadStudents}
        onResetBenchmark={handleResetBenchmark}
        isCustomData={isCustomData}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-700">Course Advisor</span>
            <span>—</span>
            <span>Personalized Academic Decision Support</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-500">
            <span>Runs locally in browser</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">100% Constraint Validated</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
