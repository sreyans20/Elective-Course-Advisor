import React, { useState } from 'react';
import {
  Target,
  Award,
  Clock,
  BookCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Check,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { Student, WorkloadPreference } from '../../types';
import { Badge } from '../Common';
import { auditUserInput, sanitizeText } from '../../utils/security';

interface StudentProfileCardProps {
  students: Student[];
  selectedStudent: Student;
  onSelectStudent: (student: Student) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
}

export const StudentProfileCard: React.FC<StudentProfileCardProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  onUpdateStudent
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editGoal, setEditGoal] = useState(selectedStudent.goal);
  const [editCgpa, setEditCgpa] = useState(selectedStudent.cgpa.toString());
  const [editWorkload, setEditWorkload] = useState<WorkloadPreference>(selectedStudent.workloadPreference);
  const [newCleared, setNewCleared] = useState('');
  const [newWeak, setNewWeak] = useState('');

  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  const currentIndex = students.findIndex(s => s.id === selectedStudent.id);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectStudent(students[currentIndex - 1]);
      setIsEditing(false);
      setSecurityNotice(null);
    }
  };

  const handleNext = () => {
    if (currentIndex < students.length - 1) {
      onSelectStudent(students[currentIndex + 1]);
      setIsEditing(false);
      setSecurityNotice(null);
    }
  };

  const handleSaveEdit = () => {
    const audit = auditUserInput(editGoal);
    if (!audit.isSafe) {
      setSecurityNotice(`Security Defense: Sanitized input. Detected suspicious pattern: ${audit.threatsDetected[0]}`);
    } else {
      setSecurityNotice(null);
    }

    const updated: Student = {
      ...selectedStudent,
      goal: audit.sanitized || selectedStudent.goal,
      cgpa: Math.max(0, Math.min(10, parseFloat(editCgpa) || selectedStudent.cgpa)),
      workloadPreference: editWorkload
    };
    onUpdateStudent(updated);
    setIsEditing(false);
  };

  const handleAddCleared = () => {
    const sanitized = sanitizeText(newCleared);
    if (sanitized && !selectedStudent.subjectsCleared.includes(sanitized)) {
      const updated = {
        ...selectedStudent,
        subjectsCleared: [...selectedStudent.subjectsCleared, sanitized]
      };
      onUpdateStudent(updated);
      setNewCleared('');
    }
  };

  const handleRemoveCleared = (subject: string) => {
    const updated = {
      ...selectedStudent,
      subjectsCleared: selectedStudent.subjectsCleared.filter(s => s !== subject)
    };
    onUpdateStudent(updated);
  };

  const handleAddWeak = () => {
    const sanitized = sanitizeText(newWeak);
    if (sanitized && !selectedStudent.weakSubjects.includes(sanitized)) {
      const updated = {
        ...selectedStudent,
        weakSubjects: [...selectedStudent.weakSubjects, sanitized]
      };
      onUpdateStudent(updated);
      setNewWeak('');
    }
  };

  const handleRemoveWeak = (subject: string) => {
    const updated = {
      ...selectedStudent,
      weakSubjects: selectedStudent.weakSubjects.filter(s => s !== subject)
    };
    onUpdateStudent(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
      {/* Top Header & Navigation controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-xs">
            {selectedStudent.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">{selectedStudent.name}</h2>
              <Badge variant="purple">{selectedStudent.id}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Student #{currentIndex + 1} of {students.length} in Dataset
            </p>
          </div>
        </div>

        {/* Student Switcher & Prev/Next */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              title="Previous Student"
              className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= students.length - 1}
              title="Next Student"
              className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <select
            value={selectedStudent.id}
            onChange={(e) => {
              const found = students.find(s => s.id === e.target.value);
              if (found) onSelectStudent(found);
            }}
            className="bg-slate-50 hover:bg-white text-slate-800 text-xs font-semibold rounded-lg px-3 py-1.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors max-w-[220px]"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.goal})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
              isEditing
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Edit student profile parameters"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEditing ? 'Close' : 'Adjust'}</span>
          </button>
        </div>
      </div>

      {/* Security notice if injection or unsafe text detected */}
      {securityNotice && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{securityNotice}</span>
        </div>
      )}

      {/* Editing Mode Form */}
      {isEditing && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Adjust Academic Preferences
            </span>
            <button
              onClick={handleSaveEdit}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">Career Goal</label>
              <input
                type="text"
                value={editGoal}
                onChange={(e) => setEditGoal(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">CGPA (0 - 10)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={editCgpa}
                onChange={(e) => setEditCgpa(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">Workload Preference</label>
              <select
                value={editWorkload}
                onChange={(e) => setEditWorkload(e.target.value as WorkloadPreference)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="Low">Low (≤10 hrs)</option>
                <option value="Moderate">Moderate (11-13 hrs)</option>
                <option value="High">High (≥14 hrs)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Profile Attributes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {/* Career Goal */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs mb-1">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Target Career Goal</span>
          </div>
          <div className="text-sm font-bold text-slate-900 truncate" title={selectedStudent.goal}>
            {selectedStudent.goal}
          </div>
        </div>

        {/* CGPA */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs mb-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Current CGPA</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-900">{selectedStudent.cgpa.toFixed(1)}</span>
            <Badge
              variant={
                selectedStudent.cgpa >= 8.5
                  ? 'success'
                  : selectedStudent.cgpa >= 7.5
                  ? 'info'
                  : 'warning'
              }
            >
              {selectedStudent.cgpa >= 8.5 ? 'Distinction' : selectedStudent.cgpa >= 7.5 ? 'First Class' : 'Average'}
            </Badge>
          </div>
        </div>

        {/* Workload Preference */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Workload Preference</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-sm font-bold text-slate-900">{selectedStudent.workloadPreference}</span>
            <span className="text-[11px] text-slate-500">
              {selectedStudent.workloadPreference === 'Low'
                ? '(≤10 hrs)'
                : selectedStudent.workloadPreference === 'Moderate'
                ? '(11-13 hrs)'
                : '(≥14 hrs)'}
            </span>
          </div>
        </div>

        {/* Quota Requirement */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs mb-1">
            <BookCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Required Electives</span>
          </div>
          <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
            {selectedStudent.requiredRaw}
          </div>
        </div>
      </div>

      {/* Cleared Subjects & Weak Subjects Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
        {/* Cleared Subjects */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-700 font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <BookCheck className="w-3.5 h-3.5" />
              Subjects Completed ({selectedStudent.subjectsCleared.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
            {selectedStudent.subjectsCleared.length > 0 ? (
              selectedStudent.subjectsCleared.map((sub) => (
                <span
                  key={sub}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{sub}</span>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveCleared(sub)}
                      className="text-rose-600 hover:text-rose-800 ml-1 text-xs"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="text-xs text-rose-600 italic bg-rose-50 px-2 py-1 rounded border border-rose-200">
                None completed (Prerequisite restrictions apply)
              </span>
            )}
          </div>
          {isEditing && (
            <div className="flex items-center gap-1.5 mt-2">
              <input
                type="text"
                placeholder="Add completed subject (e.g. Python)"
                value={newCleared}
                onChange={(e) => setNewCleared(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCleared()}
                className="bg-white text-xs px-2.5 py-1 rounded-lg border border-slate-300 text-slate-800 flex-1"
              />
              <button
                onClick={handleAddCleared}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium"
              >
                + Add
              </button>
            </div>
          )}
        </div>

        {/* Weak Subjects */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-700 font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              Subjects Needing Extra Care ({selectedStudent.weakSubjects.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
            {selectedStudent.weakSubjects.length > 0 ? (
              selectedStudent.weakSubjects.map((sub) => (
                <span
                  key={sub}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>{sub}</span>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveWeak(sub)}
                      className="text-rose-600 hover:text-rose-800 ml-1 text-xs"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No specific subject weaknesses reported</span>
            )}
          </div>
          {isEditing && (
            <div className="flex items-center gap-1.5 mt-2">
              <input
                type="text"
                placeholder="Add weak subject (e.g. Mathematics)"
                value={newWeak}
                onChange={(e) => setNewWeak(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWeak()}
                className="bg-white text-xs px-2.5 py-1 rounded-lg border border-slate-300 text-slate-800 flex-1"
              />
              <button
                onClick={handleAddWeak}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium"
              >
                + Add
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
