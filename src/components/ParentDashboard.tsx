import React from 'react';
import { PupilProfile, ExamResult } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Calendar,
  Clock,
  Printer,
  Sparkles,
  Share2,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface ParentDashboardProps {
  profile: PupilProfile;
  latestExamResult?: ExamResult | null;
  onNavigateToMap: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  profile,
  latestExamResult,
  onNavigateToMap,
}) => {
  // Curriculum subjects progress data
  const reportAreas = [
    {
      subject: 'Mathematics',
      score: 82,
      trend: 'up',
      status: 'High accuracy in arithmetic operations; practicing word problems.',
    },
    {
      subject: 'English Language',
      score: 76,
      trend: 'up',
      status: 'Strong comprehension; working on prepositions and concord.',
    },
    {
      subject: 'French (Bilinguisme)',
      score: 64,
      trend: 'same',
      status: 'Solid vocabulary; needs more irregular verb conjugation practice.',
    },
    {
      subject: 'Science & Health',
      score: 88,
      trend: 'up',
      status: 'Mastered malaria prevention and volcanic soils; excellent recall.',
    },
    {
      subject: 'Reasoning & Logic',
      score: 71,
      trend: 'up',
      status: 'Good with number sequences; developing pattern analogies.',
    },
  ];

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  return (
    <div className="max-w-4xl xl:max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
            Parent Weekly Monitoring Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-1">
            {profile.name.toUpperCase()}'S LEARNING REPORT
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Class: {profile.gradeClass} • {profile.schoolName} • Week 4 of Term 2
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Report Card</span>
          </button>
        </div>
      </div>

      {/* Main Executive Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
            Subject Competencies & Weekly Progress
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Updated automatically from mission gameplay
          </span>
        </div>

        {/* The Exact Table requested by user */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-3 sm:px-6 py-3">Area / Subject</th>
                <th className="px-3 sm:px-6 py-3">Mastery Score</th>
                <th className="px-3 sm:px-6 py-3">Weekly Trend</th>
                <th className="px-3 sm:px-6 py-3 hidden md:table-cell">Teacher / AI Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportAreas.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-slate-900 text-xs sm:text-sm">{item.subject}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="font-extrabold text-slate-900 font-display text-sm sm:text-base">
                      {item.score}%
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    {item.trend === 'up' && (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>↑ Improving</span>
                      </span>
                    )}
                    {item.trend === 'same' && (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-xs">
                        <Minus className="w-3.5 h-3.5" />
                        <span>→ Steady</span>
                      </span>
                    )}
                    {item.trend === 'down' && (
                      <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 text-xs">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>↓ Needs Polish</span>
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs text-slate-600 hidden md:table-cell leading-relaxed">
                    {item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actionable Weekly Recommendation Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-700" />
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-emerald-950 font-display">
            This Week's Action Recommendation for Parents
          </h2>
        </div>

        <div className="p-4 rounded-xl bg-white border border-emerald-200 text-sm font-semibold text-emerald-950 leading-relaxed shadow-2xs">
          "Complete 3 French comprehension missions (Yaoundé & Douala) and 2 reasoning challenges (Bamenda Toghu geometry) to push overall readiness above 85%."
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Time Studied This Week
            </span>
            <p className="text-lg font-black text-slate-900 font-display flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>5 hrs 40 mins</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Common Entrance Readiness
            </span>
            <p className="text-lg font-black text-emerald-700 font-display flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>84% • Tier 1</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Recommended College Fit
            </span>
            <p className="text-xs font-bold text-slate-800 leading-tight">
              Saker Baptist / Sasse College / GBHS
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playClickSound();
            onNavigateToMap();
          }}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span>Open Prescribed Learning Quests</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
