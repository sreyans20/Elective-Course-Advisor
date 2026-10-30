import React from 'react';
import { GitBranch, Lock, Unlock } from 'lucide-react';
import { Student, Elective } from '../../types';
import { checkStudentPrerequisites } from '../../utils/constraintSolver';

interface PrerequisiteVisualizerProps {
  student: Student;
  electives: Elective[];
}

export const PrerequisiteVisualizer: React.FC<PrerequisiteVisualizerProps> = ({
  student,
  electives
}) => {
  const eligibleCourses = electives.filter(e => checkStudentPrerequisites(student, e).isEligible);
  const lockedCourses = electives.filter(e => !checkStudentPrerequisites(student, e).isEligible);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Course Eligibility Overview
            </h3>
            <p className="text-xs text-slate-500">
              See which courses you can register for now vs courses blocked by prerequisites
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-emerald-700 font-semibold">{eligibleCourses.length} Eligible</span>
          <span className="text-slate-300">•</span>
          <span className="text-rose-700 font-semibold">{lockedCourses.length} Restricted</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Unlocked Electives */}
        <div className="p-4.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-3">
          <div className="flex items-center justify-between font-bold text-emerald-900">
            <span className="flex items-center gap-1.5">
              <Unlock className="w-4 h-4 text-emerald-600" />
              Eligible Electives ({eligibleCourses.length})
            </span>
            <span className="text-[11px] text-emerald-700 font-normal">Prerequisites Cleared</span>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {eligibleCourses.map(e => (
              <div
                key={e.id}
                className="p-2.5 rounded-lg bg-white border border-emerald-200/70 flex items-center justify-between text-slate-800 shadow-xs"
              >
                <div>
                  <span className="font-semibold text-emerald-700 mr-2">{e.id}</span>
                  <span className="font-medium text-slate-900">{e.name}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                  {e.type === 'Professional Elective' ? 'Prof' : 'Open'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Locked Electives */}
        <div className="p-4.5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-3">
          <div className="flex items-center justify-between font-bold text-rose-900">
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-rose-600" />
              Restricted by Prerequisites ({lockedCourses.length})
            </span>
            <span className="text-[11px] text-rose-700 font-normal">Requires Prior Courses</span>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {lockedCourses.map(e => {
              const check = checkStudentPrerequisites(student, e);
              return (
                <div
                  key={e.id}
                  className="p-2.5 rounded-lg bg-white border border-rose-200/70 flex items-center justify-between text-slate-800 shadow-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-semibold text-rose-700 mr-2">{e.id}</span>
                    <span className="font-medium text-slate-800">{e.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 shrink-0 font-medium">
                    Needs: {check.missingPrerequisites.join(', ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
