import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Sliders,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Badge } from './Common';

interface NavbarProps {
  activeTab: 'advisor' | 'explorer' | 'sandbox' | 'evaluation' | 'settings';
  setActiveTab: (tab: 'advisor' | 'explorer' | 'sandbox' | 'evaluation' | 'settings') => void;
  studentCount: number;
  electiveCount: number;
  isCustomData: boolean;
  onResetData: () => void;
  openSettingsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  studentCount,
  electiveCount,
  isCustomData,
  onResetData,
  openSettingsModal
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('advisor')}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-slate-900 tracking-tight">
                  Course Advisor
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Decision Support
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Personalized & conflict-free elective recommendations
              </p>
            </div>
          </div>

          {/* Clean Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('advisor')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'advisor'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Recommendations</span>
            </button>

            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'explorer'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Course Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'sandbox'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mix & Match</span>
            </button>

            <button
              onClick={() => setActiveTab('evaluation')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'evaluation'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dataset Audit (100)</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-700 font-medium">
                {studentCount} Students • {electiveCount} Courses
              </span>
              {isCustomData ? (
                <Badge variant="warning">Custom Data</Badge>
              ) : (
                <Badge variant="success">Benchmark</Badge>
              )}
            </div>

            {isCustomData && (
              <button
                onClick={onResetData}
                title="Reset to 100 students benchmark dataset"
                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={openSettingsModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium border border-indigo-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Data & Weights</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-200 scrollbar-none">
          <button
            onClick={() => setActiveTab('advisor')}
            className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 ${
              activeTab === 'advisor' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            🎓 Recommendations
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 ${
              activeTab === 'explorer' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            📚 Catalog
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 ${
              activeTab === 'sandbox' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            🧩 Mix & Match
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 ${
              activeTab === 'evaluation' ? 'bg-indigo-600 text-white' : 'text-slate-600'
            }`}
          >
            📊 Audit (100)
          </button>
        </div>
      </div>
    </header>
  );
};
