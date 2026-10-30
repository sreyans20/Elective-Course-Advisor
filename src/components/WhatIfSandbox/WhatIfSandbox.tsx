import React, { useState, useMemo } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Elective, Student, ScoringWeights } from '../../types';
import { validateCombination } from '../../utils/constraintSolver';
import { scoreCombination, DEFAULT_WEIGHTS } from '../../utils/recommendationEngine';
import { Badge, DifficultyMeter, ScoreRing } from '../Common';

interface WhatIfSandboxProps {
  electives: Elective[];
  student: Student;
  weights?: ScoringWeights;
  initialCombination?: Elective[];
}

export const WhatIfSandbox: React.FC<WhatIfSandboxProps> = ({
  electives,
  student,
  weights = DEFAULT_WEIGHTS,
  initialCombination
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialCombination ? initialCombination.map(e => e.id) : []
  );

  const selectedCourses = useMemo(() => {
    return selectedIds.map(id => electives.find(e => e.id === id)!).filter(Boolean);
  }, [selectedIds, electives]);

  const validationResult = useMemo(() => {
    return validateCombination(selectedCourses, student);
  }, [selectedCourses, student]);

  const scoreResult = useMemo(() => {
    if (selectedCourses.length === 0) return null;
    return scoreCombination(selectedCourses, student, weights);
  }, [selectedCourses, student, weights]);

  const totalHours = selectedCourses.reduce((sum, c) => sum + c.weeklyHours, 0);
  const avgDiff = selectedCourses.length > 0
    ? selectedCourses.reduce((sum, c) => sum + c.difficulty, 0) / selectedCourses.length
    : 0;

  const handleToggleCourse = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      if (selectedIds.length < 5) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleClear = () => {
    setSelectedIds([]);
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Mix & Match Course Sandbox
              </h2>
              <p className="text-xs text-slate-500">
                Choose electives freely to check schedule overlaps, prerequisite compliance, and instant match scores.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              disabled={selectedIds.length === 0}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Mix</span>
            </button>
          </div>
        </div>

        {/* Real-time Constraint Validator Status Banner */}
        <div className="pt-1">
          {selectedCourses.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
              Select 2 to 4 courses from the list below to check timetable compatibility and calculate your fit score.
            </div>
          ) : validationResult.isValid ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-emerald-900 text-sm">Valid Combination Verified!</h4>
                  <p className="text-emerald-800 text-xs">
                    No schedule clashes, all course prerequisites satisfied, and matches required quota ({student.requiredRaw}).
                  </p>
                </div>
              </div>
              {scoreResult && (
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs text-slate-600 hidden sm:inline font-medium">Recalculated Score:</span>
                  <ScoreRing score={scoreResult.totalScore} size="md" />
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2 shadow-xs">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-900 text-sm">Conflict or Prerequisite Issue Detected</h4>
                  <p className="text-rose-800 text-xs">
                    This combination cannot be registered under current college rules.
                  </p>
                </div>
              </div>

              {/* Detailed Conflict List */}
              <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-1.5 text-xs text-slate-700">
                {validationResult.conflicts.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-rose-800 font-medium text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                    <span>{c.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Combination Visualizer & Metrics */}
      {selectedCourses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Selected Courses List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider px-1">
              <span>Your Selected Courses ({selectedCourses.length})</span>
              <span className="text-indigo-700 font-medium">Required Quota: {student.requiredRaw}</span>
            </div>

            <div className="space-y-2">
              {selectedCourses.map((course) => {
                const isClashing = validationResult.timetableClashes.some(
                  tc => tc.courseA === course.name || tc.courseB === course.name
                );
                const isMissingPrereq = validationResult.missingPrerequisites.some(
                  mp => mp.courseId === course.id
                );

                return (
                  <div
                    key={course.id}
                    className={`p-3.5 rounded-xl border bg-white flex items-center justify-between gap-3 shadow-xs ${
                      isClashing || isMissingPrereq
                        ? 'border-rose-300 bg-rose-50/30'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Badge variant={course.type === 'Professional Elective' ? 'info' : 'purple'}>
                        {course.id}
                      </Badge>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900">{course.name}</h4>
                          {isClashing && (
                            <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                              Timetable Clash
                            </span>
                          )}
                          {isMissingPrereq && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                              Missing Prerequisite
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-semibold text-indigo-700">{course.timetableSlot}</span>
                          <span>•</span>
                          <span>{course.weeklyHours} hrs/wk</span>
                          <span>•</span>
                          <span>Diff: {course.difficulty}/5</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleCourse(course.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Remove from mix"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Weekly Schedule Preview Grid */}
            <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Weekly Schedule Visualizer (Conflict Detector)
                </span>
                <span className="text-slate-400 text-[11px] font-normal">Mon - Fri Slots</span>
              </div>

              <div className="grid grid-cols-5 gap-2 text-xs">
                {days.map((day) => {
                  const dayCourses = selectedCourses.filter(c =>
                    c.slots.some(s => s.day === day)
                  );
                  return (
                    <div key={day} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5 min-h-[90px]">
                      <div className="text-[11px] font-bold text-slate-600 text-center pb-1 border-b border-slate-200">
                        {day}
                      </div>
                      {dayCourses.length > 0 ? (
                        dayCourses.map((c) => (
                          <div
                            key={c.id}
                            className={`p-1.5 rounded-lg text-[10px] font-semibold border truncate ${
                              dayCourses.length > 1
                                ? 'bg-rose-50 border-rose-300 text-rose-800'
                                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                            }`}
                            title={`${c.name} (${c.timetableSlot})`}
                          >
                            <span className="block font-medium">{c.timetableSlot.split(' ')[1] || c.id}</span>
                            <span className="truncate block font-bold">{c.name}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-[10px] text-slate-400 text-center pt-5 italic">Free</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Metrics & Scoring Panel */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Live Combination Score
              </h3>

              {scoreResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs text-slate-600 font-medium">Composite Fit Score</span>
                    <span className="text-2xl font-black text-emerald-700 font-mono">
                      {scoreResult.totalScore}/100
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-700 mb-1 font-medium">
                        <span>Career Synergy ({student.goal})</span>
                        <span className="text-indigo-700 font-semibold">{scoreResult.careerScore}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${scoreResult.careerScore}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 mb-1 font-medium">
                        <span>Skill Breadth</span>
                        <span className="text-sky-700 font-semibold">{scoreResult.skillScore}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-sky-600 h-full rounded-full" style={{ width: `${scoreResult.skillScore}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 mb-1 font-medium">
                        <span>Workload Suitability ({student.workloadPreference})</span>
                        <span className="text-emerald-700 font-semibold">{scoreResult.workloadScore}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${scoreResult.workloadScore}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 mb-1 font-medium">
                        <span>Difficulty Pacing</span>
                        <span className="text-amber-700 font-semibold">{scoreResult.difficultyScore}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-600 h-full rounded-full" style={{ width: `${scoreResult.difficultyScore}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">Total Hours</span>
                      <span className="text-sm font-bold text-slate-900">{totalHours}h / wk</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">Avg Difficulty</span>
                      <span className="text-sm font-bold text-slate-900">{avgDiff.toFixed(1)} / 5</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Available Electives Selector Drawer */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Available Electives (Click to Add / Remove)</span>
          <span className="text-xs text-slate-500 normal-case font-medium">
            Selected: {selectedIds.length} / 4 courses
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {electives.map((course) => {
            const isSelected = selectedIds.includes(course.id);
            return (
              <button
                key={course.id}
                onClick={() => handleToggleCourse(course.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-slate-900 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-[10px] text-indigo-700">{course.id}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{course.weeklyHours}h</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 line-clamp-1">{course.name}</div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 mt-1 border-t border-slate-100">
                  <span className="truncate">{course.timetableSlot}</span>
                  <span className={isSelected ? 'text-indigo-700 font-bold' : 'text-slate-400'}>
                    {isSelected ? '✓ Added' : '+ Add'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
