import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Elective, Student } from '../../types';
import { checkStudentPrerequisites } from '../../utils/constraintSolver';
import { Badge, DifficultyMeter } from '../Common';

interface ElectiveExplorerProps {
  electives: Elective[];
  selectedStudent: Student;
  onSelectForSandbox: (elective: Elective) => void;
}

export const ElectiveExplorer: React.FC<ElectiveExplorerProps> = ({
  electives,
  selectedStudent,
  onSelectForSandbox
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [eligibilityFilter, setEligibilityFilter] = useState<'ALL' | 'ELIGIBLE' | 'MISSING_PREREQ'>('ALL');
  const [selectedCareerTag, setSelectedCareerTag] = useState<string>('ALL');

  const allCareerTags = useMemo(() => {
    const set = new Set<string>();
    electives.forEach(e => e.careerTags.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [electives]);

  const filteredElectives = useMemo(() => {
    return electives.filter((course) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = course.name.toLowerCase().includes(query);
        const matchesId = course.id.toLowerCase().includes(query);
        const matchesSkill = course.skillTags.some(s => s.toLowerCase().includes(query));
        const matchesCareer = course.careerTags.some(c => c.toLowerCase().includes(query));
        if (!matchesName && !matchesId && !matchesSkill && !matchesCareer) {
          return false;
        }
      }

      if (selectedType !== 'ALL' && course.type !== selectedType) {
        return false;
      }

      if (selectedCareerTag !== 'ALL' && !course.careerTags.includes(selectedCareerTag)) {
        return false;
      }

      const prereqCheck = checkStudentPrerequisites(selectedStudent, course);
      if (eligibilityFilter === 'ELIGIBLE' && !prereqCheck.isEligible) {
        return false;
      }
      if (eligibilityFilter === 'MISSING_PREREQ' && prereqCheck.isEligible) {
        return false;
      }

      return true;
    });
  }, [electives, searchTerm, selectedType, selectedCareerTag, eligibilityFilter, selectedStudent]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by course name, code (e.g. CS401), skills, or career tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
            {['ALL', 'Professional Elective', 'Open Elective'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedType === t
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? 'All Types' : t.replace(' Elective', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Eligibility Filter for current student */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Eligibility for {selectedStudent.name}:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setEligibilityFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  eligibilityFilter === 'ALL'
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setEligibilityFilter('ELIGIBLE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                  eligibilityFilter === 'ELIGIBLE'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Eligible Only
              </button>
              <button
                onClick={() => setEligibilityFilter('MISSING_PREREQ')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                  eligibilityFilter === 'MISSING_PREREQ'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" /> Missing Prerequisites
              </button>
            </div>
          </div>

          {/* Career Tag Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Career Field:</span>
            <select
              value={selectedCareerTag}
              onChange={(e) => setSelectedCareerTag(e.target.value)}
              className="bg-slate-50 text-slate-800 rounded-lg px-2.5 py-1 border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Career Domains</option>
              {allCareerTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
        <span>Showing {filteredElectives.length} of {electives.length} electives</span>
        <span>Click any course to test in the Mix & Match Sandbox</span>
      </div>

      {/* Electives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredElectives.map((course) => {
          const prereqCheck = checkStudentPrerequisites(selectedStudent, course);
          return (
            <div
              key={course.id}
              className={`rounded-2xl border bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all group ${
                prereqCheck.isEligible ? 'border-slate-200/90' : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant={course.type === 'Professional Elective' ? 'info' : 'purple'}>
                      {course.id}
                    </Badge>
                    <span className="text-xs text-slate-500">{course.type}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {course.weeklyHours} hrs/wk
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                  {course.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {course.description}
                </p>
              </div>

              {/* Timetable Slot & Difficulty */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    {course.timetableSlot}
                  </span>
                  <DifficultyMeter difficulty={course.difficulty} />
                </div>

                {/* Prerequisite Status for selected student */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                      Prerequisites:
                    </span>
                    {prereqCheck.isEligible ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Eligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-semibold">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Missing
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-slate-700 text-[11px]">
                    {course.prerequisites.length > 0 ? (
                      course.prerequisites.map(p => {
                        const isCleared = selectedStudent.subjectsCleared.some(s => s.toLowerCase() === p.toLowerCase());
                        return (
                          <span
                            key={p}
                            className={`inline-block mr-1.5 px-2 py-0.5 rounded text-[10px] font-medium ${
                              isCleared
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {isCleared ? '✓ ' : '✗ '} {p}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-slate-400 italic">None (Open to all)</span>
                    )}
                  </div>
                </div>

                {/* Skill tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {course.skillTags.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action */}
              <button
                onClick={() => onSelectForSandbox(course)}
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 hover:border-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <span>Add to Mix & Match</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
