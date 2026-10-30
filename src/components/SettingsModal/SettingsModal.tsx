import React, { useState } from 'react';
import {
  X,
  Sliders,
  Download,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ScoringWeights, Elective, Student } from '../../types';
import { DEFAULT_WEIGHTS } from '../../utils/recommendationEngine';
import {
  parseElectivesCSV,
  parseStudentsCSV,
  generateElectivesCSVTemplate,
  generateStudentsCSVTemplate
} from '../../utils/parser';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: ScoringWeights;
  onUpdateWeights: (newWeights: ScoringWeights) => void;
  electives: Elective[];
  students: Student[];
  onUploadElectives: (electives: Elective[]) => void;
  onUploadStudents: (students: Student[]) => void;
  onResetBenchmark: () => void;
  isCustomData: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  weights,
  onUpdateWeights,
  electives,
  students,
  onUploadElectives,
  onUploadStudents,
  onResetBenchmark,
  isCustomData
}) => {
  const [activeTab, setActiveTab] = useState<'weights' | 'data'>('weights');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleElectiveFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { electives: parsed, errors } = parseElectivesCSV(text);
      if (parsed.length > 0) {
        onUploadElectives(parsed);
        setUploadSuccess(`Loaded ${parsed.length} electives successfully!`);
        setUploadError(errors.length > 0 ? `Notice: ${errors.slice(0, 3).join(', ')}` : null);
      } else {
        setUploadError(`Failed to parse electives CSV: ${errors.join(', ')}`);
      }
    };
    reader.readAsText(file);
  };

  const handleStudentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { students: parsed, errors } = parseStudentsCSV(text);
      if (parsed.length > 0) {
        onUploadStudents(parsed);
        setUploadSuccess(`Loaded ${parsed.length} student profiles successfully!`);
        setUploadError(errors.length > 0 ? `Notice: ${errors.slice(0, 3).join(', ')}` : null);
      } else {
        setUploadError(`Failed to parse students CSV: ${errors.join(', ')}`);
      }
    };
    reader.readAsText(file);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recommendation Settings & Datasets
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 text-xs font-semibold bg-slate-50/60 p-1">
          <button
            onClick={() => setActiveTab('weights')}
            className={`flex-1 py-2.5 rounded-xl text-center transition-all ${
              activeTab === 'weights'
                ? 'text-indigo-700 bg-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚖️ Recommendation Weights
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-2.5 rounded-xl text-center transition-all ${
              activeTab === 'data'
                ? 'text-indigo-700 bg-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📂 CSV Data & Uploads
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {activeTab === 'weights' ? (
            <div className="space-y-5 text-xs">
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-slate-700 space-y-1">
                <span className="font-bold text-indigo-900">Custom Scoring Weights:</span>
                <p className="text-[11px] text-slate-600">
                  Configure how heavily each criterion influences the top recommendations:
                </p>
              </div>

              {/* Slider 1: Career */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">Career Goal Alignment</span>
                  <span className="font-bold text-indigo-700">{Math.round(weights.careerWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.70"
                  step="0.05"
                  value={weights.careerWeight}
                  onChange={(e) => onUpdateWeights({ ...weights, careerWeight: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 bg-slate-100 rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Slider 2: Skill */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">Skill Development Breadth</span>
                  <span className="font-bold text-sky-700">{Math.round(weights.skillWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.50"
                  step="0.05"
                  value={weights.skillWeight}
                  onChange={(e) => onUpdateWeights({ ...weights, skillWeight: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 bg-slate-100 rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Slider 3: Workload */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">Workload Preference Fit</span>
                  <span className="font-bold text-emerald-700">{Math.round(weights.workloadWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={weights.workloadWeight}
                  onChange={(e) => onUpdateWeights({ ...weights, workloadWeight: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 bg-slate-100 rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Slider 4: Difficulty */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">Difficulty Suitability</span>
                  <span className="font-bold text-amber-700">{Math.round(weights.difficultyWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={weights.difficultyWeight}
                  onChange={(e) => onUpdateWeights({ ...weights, difficultyWeight: parseFloat(e.target.value) })}
                  className="w-full accent-amber-600 bg-slate-100 rounded-lg h-2 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onUpdateWeights(DEFAULT_WEIGHTS)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Recommended Defaults</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 text-xs">
              {uploadSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{uploadSuccess}</span>
                </div>
              )}
              {uploadError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Current Loaded Dataset</span>
                  <span className="font-semibold text-indigo-700">
                    {electives.length} Electives • {students.length} Students
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  All processing runs locally in your browser with complete privacy.
                </p>
              </div>

              {/* Upload Dropzones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-5 rounded-2xl border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/50 text-center space-y-2 transition-colors">
                  <FileSpreadsheet className="w-7 h-7 text-indigo-600 mx-auto" />
                  <div className="font-bold text-slate-900">Upload Electives.csv</div>
                  <p className="text-[11px] text-slate-500">Columns: Course ID, Name, Type, Slot, Prerequisites, Difficulty, Hours, Tags</p>
                  <label className="inline-block mt-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer transition-colors shadow-xs">
                    <span>Choose File</span>
                    <input type="file" accept=".csv" onChange={handleElectiveFileUpload} className="hidden" />
                  </label>
                </div>

                <div className="p-5 rounded-2xl border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/50 text-center space-y-2 transition-colors">
                  <FileSpreadsheet className="w-7 h-7 text-indigo-600 mx-auto" />
                  <div className="font-bold text-slate-900">Upload Students.csv</div>
                  <p className="text-[11px] text-slate-500">Columns: Student ID, Name, Goal, CGPA, Cleared, Weak, Workload, Quota</p>
                  <label className="inline-block mt-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer transition-colors shadow-xs">
                    <span>Choose File</span>
                    <input type="file" accept=".csv" onChange={handleStudentFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Sample Templates & Reset */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadFile('Electives_Template.csv', generateElectivesCSVTemplate(electives))}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Electives.csv</span>
                  </button>

                  <button
                    onClick={() => downloadFile('Students_Template.csv', generateStudentsCSVTemplate(students))}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Students.csv</span>
                  </button>
                </div>

                {isCustomData && (
                  <button
                    onClick={() => {
                      onResetBenchmark();
                      setUploadSuccess('Restored 100 students benchmark dataset.');
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Benchmark</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
