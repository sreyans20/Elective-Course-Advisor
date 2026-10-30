import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { StudentRecommendationResult } from '../../types';

interface UnmetNeedsAlertProps {
  result: StudentRecommendationResult;
}

export const UnmetNeedsAlert: React.FC<UnmetNeedsAlertProps> = ({ result }) => {
  const { status, statusExplanation, missingPrerequisiteBlockers, timetableConflictBlockers, student } = result;

  if (status === 'FULLY_SATISFIED') {
    return (
      <div className="rounded-2xl bg-emerald-50/90 border border-emerald-200 p-4 flex items-start space-x-3 text-xs shadow-xs">
        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-emerald-900 text-sm">All Prerequisites & Schedule Rules Met</h4>
          <p className="text-emerald-800/90 mt-0.5 leading-relaxed">
            Every recommended combination satisfies your required quota ({student.requiredRaw}), has zero timetable clashes, matches your workload preference ({student.workloadPreference}), and directly supports your goal ({student.goal}).
          </p>
        </div>
      </div>
    );
  }

  if (status === 'NO_VALID_COMBINATION') {
    return (
      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 space-y-3 shadow-xs">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                Prerequisite Bottleneck
              </span>
              <h4 className="font-bold text-rose-900 text-base">No Valid Combination Found</h4>
            </div>
            <p className="text-rose-800 text-xs leading-relaxed">
              {statusExplanation}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-rose-100 space-y-2 text-xs">
          <div className="font-semibold text-rose-900 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-rose-600" /> Explanation of Restrictions:
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
            <li>
              Required quota is <span className="font-semibold text-slate-900">{student.requiredRaw}</span>, but the student has not yet cleared prerequisites for enough available electives.
            </li>
            {missingPrerequisiteBlockers.length > 0 && (
              <li>
                Missing gateway prerequisites:{' '}
                <span className="font-semibold text-rose-700">
                  {missingPrerequisiteBlockers.slice(0, 5).join(', ')}
                </span>
              </li>
            )}
            {timetableConflictBlockers.length > 0 && (
              <li>
                Potential timetable slot conflicts:{' '}
                <span className="font-semibold text-amber-800">
                  {timetableConflictBlockers.slice(0, 3).join(', ')}
                </span>
              </li>
            )}
          </ul>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 text-rose-800 font-medium">
          <span>Advising Guidance:</span>
          <span className="text-slate-600">
            Complete introductory prerequisites in the upcoming term to unlock these pathways.
          </span>
        </div>
      </div>
    );
  }

  // PARTIALLY_SATISFIED
  return (
    <div className="rounded-2xl bg-amber-50/90 border border-amber-200 p-4.5 space-y-2.5 shadow-xs">
      <div className="flex items-start space-x-3">
        <div className="p-1.5 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
              Trade-off Notice
            </span>
            <h4 className="font-bold text-amber-900 text-sm">Valid Combinations Found With Trade-Offs</h4>
          </div>
          <p className="text-amber-800 text-xs leading-relaxed">
            {statusExplanation}
          </p>
        </div>
      </div>

      {missingPrerequisiteBlockers.length > 0 && (
        <div className="bg-white rounded-xl px-3.5 py-2.5 border border-amber-100 text-xs flex items-center justify-between text-slate-700">
          <div>
            <span className="text-amber-800 font-semibold">Future Pathway: </span>
            Completing <span className="font-semibold text-indigo-700">{missingPrerequisiteBlockers.slice(0, 3).join(', ')}</span> next term will unlock more advanced electives.
          </div>
        </div>
      )}
    </div>
  );
};
