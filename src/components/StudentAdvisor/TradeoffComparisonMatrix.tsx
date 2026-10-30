import React from 'react';
import { Scale, Check, X } from 'lucide-react';
import { RecommendedCombination, Student } from '../../types';
import { Badge } from '../Common';

interface TradeoffComparisonMatrixProps {
  recommendations: RecommendedCombination[];
  student: Student;
}

export const TradeoffComparisonMatrix: React.FC<TradeoffComparisonMatrixProps> = ({
  recommendations,
  student
}) => {
  if (recommendations.length < 2) {
    return null;
  }

  const domains = [
    { label: 'AI & Machine Learning', tag: 'ai' },
    { label: 'Cloud & Infrastructure', tag: 'cloud' },
    { label: 'Data Science & Analytics', tag: 'data' },
    { label: 'Full Stack & Web Engineering', tag: 'web' },
    { label: 'Cybersecurity & Defense', tag: 'security' }
  ];

  const hasTag = (rec: RecommendedCombination, tagSnippet: string) => {
    return rec.electives.some(e =>
      e.careerTags.some(t => t.toLowerCase().includes(tagSnippet)) ||
      e.skillTags.some(s => s.toLowerCase().includes(tagSnippet))
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Compare Recommended Options Side-by-Side
            </h3>
            <p className="text-xs text-slate-500">
              Clear breakdown of what you gain and sacrifice across your top choices
            </p>
          </div>
        </div>
        <Badge variant="purple">Decision Support</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-700">
              <th className="py-3 px-3.5 font-bold w-1/4 rounded-l-lg">Criteria</th>
              {recommendations.map((rec) => (
                <th key={rec.rank} className="py-3 px-3.5 font-bold text-center">
                  <div className="flex flex-col items-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase mb-1 ${
                        rec.rank === 1
                          ? 'bg-emerald-600 text-white'
                          : rec.rank === 2
                          ? 'bg-indigo-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      Option #{rec.rank}
                    </span>
                    <span className="text-slate-800 font-semibold">{rec.profileTitle.split(':')[1] || rec.profileTitle}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Total Score */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 px-3.5 font-semibold text-slate-800">Match Rating</td>
              {recommendations.map((rec) => (
                <td key={rec.rank} className="py-3 px-3.5 text-center">
                  <span className="text-sm font-bold font-mono text-emerald-700">
                    {rec.scoreBreakdown.totalScore}/100
                  </span>
                </td>
              ))}
            </tr>

            {/* Career Synergy */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 px-3.5 font-semibold text-slate-800">
                Career Fit ({student.goal})
              </td>
              {recommendations.map((rec) => (
                <td key={rec.rank} className="py-3 px-3.5 text-center">
                  <span
                    className={`font-semibold font-mono ${
                      rec.scoreBreakdown.careerScore >= 80
                        ? 'text-emerald-700'
                        : rec.scoreBreakdown.careerScore >= 60
                        ? 'text-indigo-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {rec.scoreBreakdown.careerScore}% match
                  </span>
                </td>
              ))}
            </tr>

            {/* Weekly Hours */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 px-3.5 font-semibold text-slate-800">Weekly Commitment</td>
              {recommendations.map((rec) => (
                <td key={rec.rank} className="py-3 px-3.5 text-center">
                  <span className="font-bold text-slate-900">{rec.totalWeeklyHours} hrs/wk</span>
                  <span className="block text-[10px] text-slate-500 font-medium">
                    {rec.totalWeeklyHours <= 10
                      ? 'Light'
                      : rec.totalWeeklyHours <= 13
                      ? 'Moderate'
                      : 'Intensive'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Difficulty */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 px-3.5 font-semibold text-slate-800">Avg Course Difficulty</td>
              {recommendations.map((rec) => (
                <td key={rec.rank} className="py-3 px-3.5 text-center">
                  <span className="font-bold text-slate-900">{rec.averageDifficulty.toFixed(1)} / 5</span>
                </td>
              ))}
            </tr>

            {/* Domain skills breakdown */}
            {domains.map((d) => (
              <tr key={d.tag} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-3.5 text-slate-600">{d.label}</td>
                {recommendations.map((rec) => {
                  const covered = hasTag(rec, d.tag);
                  return (
                    <td key={rec.rank} className="py-2.5 px-3.5 text-center">
                      {covered ? (
                        <span className="inline-flex items-center text-emerald-700 gap-1 font-semibold">
                          <Check className="w-4 h-4 text-emerald-600" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-slate-400 gap-1">
                          <X className="w-3.5 h-3.5" /> No
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Primary Sacrifice / Give Up */}
            <tr className="bg-amber-50/40">
              <td className="py-3 px-3.5 font-bold text-amber-900">
                Primary Trade-Off / What You Give Up
              </td>
              {recommendations.map((rec) => (
                <td key={rec.rank} className="py-3 px-3.5 text-amber-900 text-xs leading-relaxed">
                  {rec.tradeoffs[0] || 'Minor curriculum differences'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
