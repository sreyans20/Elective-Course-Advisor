import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Flame,
  Award,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calendar,
  Layers
} from 'lucide-react';
import { RecommendedCombination, Student } from '../../types';
import { Badge, DifficultyMeter, ScoreRing } from '../Common';

interface RecommendationCardProps {
  recommendation: RecommendedCombination;
  student: Student;
  onSendToSandbox?: (rec: RecommendedCombination) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  student,
  onSendToSandbox
}) => {
  const [activeTab, setActiveTab] = useState<'benefits' | 'tradeoffs' | 'scores'>('benefits');

  const {
    rank,
    profileTitle,
    profileSubtitle,
    electives,
    scoreBreakdown,
    totalWeeklyHours,
    averageDifficulty,
    benefits,
    tradeoffs,
    weakSubjectWarnings
  } = recommendation;

  const rankThemes = {
    1: {
      border: 'border-emerald-200/90',
      badge: 'bg-emerald-600 text-white font-bold',
      headerBg: 'from-emerald-50/60 via-white to-white',
      accentColor: 'text-emerald-700',
      pillText: 'Best Match'
    },
    2: {
      border: 'border-indigo-200/90',
      badge: 'bg-indigo-600 text-white font-bold',
      headerBg: 'from-indigo-50/60 via-white to-white',
      accentColor: 'text-indigo-700',
      pillText: 'Balanced Choice'
    },
    3: {
      border: 'border-amber-200/90',
      badge: 'bg-amber-600 text-white font-bold',
      headerBg: 'from-amber-50/60 via-white to-white',
      accentColor: 'text-amber-700',
      pillText: 'Manageable Workload'
    }
  };

  const currentTheme = rankThemes[rank];

  return (
    <div
      className={`rounded-2xl border bg-white shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden ${currentTheme.border}`}
    >
      {/* Top Banner */}
      <div className={`p-5 sm:p-6 bg-gradient-to-r ${currentTheme.headerBg} border-b border-slate-100`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider ${currentTheme.badge}`}>
                {currentTheme.pillText}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {profileTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-500">{profileSubtitle}</p>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-center">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-500 block font-medium">Match Rating</span>
              <span className="text-xs font-semibold text-emerald-700">
                {scoreBreakdown.careerScore}% Career Match
              </span>
            </div>
            <ScoreRing score={scoreBreakdown.totalScore} size="md" />
          </div>
        </div>

        {/* Quick summary stats bar */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <Clock className="w-4 h-4 text-sky-600" />
            <div>
              <span className="text-slate-400 text-[11px] block">Weekly Time</span>
              <span className="font-bold text-slate-800">{totalWeeklyHours} hrs / week</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-600">
            <Flame className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-slate-400 text-[11px] block">Avg Difficulty</span>
              <span className="font-bold text-slate-800">{averageDifficulty.toFixed(1)} / 5.0</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-600">
            <Layers className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-slate-400 text-[11px] block">Quota</span>
              <span className="font-bold text-slate-800">{electives.length} Electives</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Courses List */}
      <div className="p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <span>Included Courses ({electives.length})</span>
          <span className="text-emerald-700 flex items-center gap-1 font-normal lowercase">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 0 clashes • all prerequisites satisfied
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {electives.map((course) => (
            <div
              key={course.id}
              className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 transition-colors flex flex-col justify-between space-y-2.5"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <Badge variant={course.type === 'Professional Elective' ? 'info' : 'purple'}>
                    {course.id} • {course.type === 'Professional Elective' ? 'Prof' : 'Open'}
                  </Badge>
                  <span className="text-[11px] font-medium text-slate-500">{course.weeklyHours}h/wk</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 tracking-tight line-clamp-1" title={course.name}>
                  {course.name}
                </h4>
              </div>

              {/* Timetable slot */}
              <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate text-[11px] font-medium">{course.timetableSlot}</span>
              </div>

              {/* Difficulty & Skill badges */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <DifficultyMeter difficulty={course.difficulty} />
              </div>

              <div className="flex flex-wrap gap-1">
                {course.skillTags.slice(0, 2).map((s) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200/80 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explainability Section: Benefits, Trade-offs & Score Breakdown */}
      <div className="px-5 sm:px-6 pb-6 pt-1">
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
          {/* Sub-tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/70 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('benefits')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'benefits'
                  ? 'text-emerald-800 border-b-2 border-emerald-600 bg-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Why Recommended (Benefits)</span>
            </button>

            <button
              onClick={() => setActiveTab('tradeoffs')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'tradeoffs'
                  ? 'text-amber-800 border-b-2 border-amber-600 bg-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              <span>What You Give Up (Trade-offs)</span>
            </button>

            <button
              onClick={() => setActiveTab('scores')}
              className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'scores'
                  ? 'text-indigo-800 border-b-2 border-indigo-600 bg-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Score Breakdown</span>
            </button>
          </div>

          {/* Sub-tab Content */}
          <div className="p-4.5 text-xs">
            {activeTab === 'benefits' && (
              <div className="space-y-2">
                <ul className="space-y-2">
                  {benefits.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'tradeoffs' && (
              <div className="space-y-2.5">
                <p className="text-slate-500 text-[11px] italic">
                  Every selection involves compromises. Here is what is sacrificed or requires extra preparation:
                </p>
                <ul className="space-y-2">
                  {tradeoffs.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-amber-900">
                      <Scale className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                {weakSubjectWarnings.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5 text-xs text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Potential Difficulty Notice:
                    </div>
                    {weakSubjectWarnings.map((w, idx) => (
                      <p key={idx} className="text-xs leading-relaxed pl-5 text-amber-800/90">
                        {w}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'scores' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <span className="text-[11px] text-slate-500 block font-medium">Career Alignment</span>
                  <span className="text-base font-bold text-indigo-700 font-mono">
                    {scoreBreakdown.careerScore}/100
                  </span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${scoreBreakdown.careerScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <span className="text-[11px] text-slate-500 block font-medium">Skill Breadth</span>
                  <span className="text-base font-bold text-sky-700 font-mono">
                    {scoreBreakdown.skillScore}/100
                  </span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full"
                      style={{ width: `${scoreBreakdown.skillScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <span className="text-[11px] text-slate-500 block font-medium">Workload Match</span>
                  <span className="text-base font-bold text-emerald-700 font-mono">
                    {scoreBreakdown.workloadScore}/100
                  </span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${scoreBreakdown.workloadScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <span className="text-[11px] text-slate-500 block font-medium">Difficulty Pacing</span>
                  <span className="text-base font-bold text-amber-700 font-mono">
                    {scoreBreakdown.difficultyScore}/100
                  </span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full"
                      style={{ width: `${scoreBreakdown.difficultyScore}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        {onSendToSandbox && (
          <div className="flex justify-end mt-3">
            <button
              onClick={() => onSendToSandbox(recommendation)}
              className="text-xs text-indigo-700 hover:text-indigo-800 flex items-center gap-1 font-semibold hover:underline"
            >
              <span>Test in Mix & Match Sandbox</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
