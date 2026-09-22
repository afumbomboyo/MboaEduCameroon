import React, { useState } from 'react';
import { MOCK_STUDENTS, SCHOOL_LEAGUE_TABLE } from '../data/mockSchoolData';
import {
  School,
  Trophy,
  Users,
  Flame,
  Award,
  AlertTriangle,
  Play,
  Plus,
  Clock,
  CheckCircle2,
  BarChart2,
  TrendingUp,
} from 'lucide-react';
import { playClickSound, playFanfare } from '../utils/audio';

export const TeacherDashboard: React.FC = () => {
  const [activeClass, setActiveClass] = useState<'p6a' | 'p6b'>('p6a');
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [challengeSubject, setChallengeSubject] = useState('Mathematics');
  const [challengeDuration, setChallengeDuration] = useState('20');
  const [challengeQuestions, setChallengeQuestions] = useState('30');
  const [activeChallengeNotification, setActiveChallengeNotification] = useState<string | null>(
    'Primary 6A vs Primary 6B Mathematics Derby is currently LIVE (Week 4)!'
  );

  const handleLaunchChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    playFanfare();
    setActiveChallengeNotification(
      `New Class Challenge Created: Primary 6A vs Primary 6B • ${challengeSubject} (${challengeQuestions} Questions in ${challengeDuration} mins)`
    );
    setShowCreateChallenge(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
            Teacher & School Administration
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-1">
            St. Joseph's Boys Primary School, Buea
          </h1>
          <p className="text-xs text-slate-500">
            Lead Educator Portal • Basic Education Inspection Zone: Fako Division
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Class switcher */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => {
                playClickSound();
                setActiveClass('p6a');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeClass === 'p6a' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Primary 6A (42 Pupils)
            </button>
            <button
              onClick={() => {
                playClickSound();
                setActiveClass('p6b');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeClass === 'p6b' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Primary 6B (39 Pupils)
            </button>
          </div>

          <button
            id="open-challenge-creator-btn"
            onClick={() => {
              playClickSound();
              setShowCreateChallenge(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Class Challenge</span>
          </button>
        </div>
      </div>

      {/* Active Challenge Alert Banner */}
      {activeChallengeNotification && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-400 shrink-0" />
            <span className="font-extrabold text-amber-950">
              {activeChallengeNotification}
            </span>
          </div>
          <span className="font-bold text-orange-800 bg-white px-2 py-0.5 rounded-md border border-orange-200 shrink-0">
            Active Now
          </span>
        </div>
      )}

      {/* Key Class Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">
            Class Examination Readiness
          </span>
          <p className="text-2xl font-black text-emerald-700 font-display">84.2%</p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.8% from last week</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">
            Avg Daily Study Time
          </span>
          <p className="text-2xl font-black text-slate-900 font-display">42 mins</p>
          <p className="text-[11px] text-slate-500 font-medium">92% active attendance</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">
            Top Subject Strength
          </span>
          <p className="text-lg font-black text-slate-900 font-display truncate">
            Science & Health
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">89% class average</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">
            Top Priority Weakness
          </span>
          <p className="text-lg font-black text-rose-700 font-display truncate">
            Fractions & Verbs
          </p>
          <p className="text-[11px] text-rose-600 font-medium">18 pupils need drill</p>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              {activeClass === 'p6a' ? 'Primary 6A' : 'Primary 6B'} Student Roster & Exam Readiness
            </h2>
            <p className="text-xs text-slate-500">
              Real-time monitoring of competencies, attendance, and weak topics
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Showing top active learners
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Pupil Name</th>
                <th className="px-5 py-3">Overall Score</th>
                <th className="px-5 py-3">Common Entrance Readiness</th>
                <th className="px-5 py-3">Study Time</th>
                <th className="px-5 py-3">Weakest Topic (AI Flagged)</th>
                <th className="px-5 py-3 hidden md:table-cell">Strongest Subject</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_STUDENTS.map((std) => (
                <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                      {std.name.charAt(0)}
                    </span>
                    <span>{std.name}</span>
                  </td>
                  <td className="px-5 py-3.5 font-extrabold text-slate-900 font-display">
                    {std.overallScore}%
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${
                        std.examReadiness >= 90
                          ? 'bg-emerald-100 text-emerald-800'
                          : std.examReadiness >= 75
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {std.examReadiness}% Readiness
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 font-medium">
                    {Math.round(std.timeSpentMinutes / 60)}h {std.timeSpentMinutes % 60}m
                  </td>
                  <td className="px-5 py-3.5 text-rose-700 font-semibold">
                    {std.weakestTopic}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium hidden md:table-cell">
                    {std.strongestSubject}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inter-School Digital Championship League Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
              <span>Cameroon Primary School Digital Championship</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 font-display mt-1">
              🏆 School League • Buea & National Zone (Week 4)
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Progression: School → Subdivision → Division → Region → National
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">School Name</th>
                <th className="px-4 py-3">Region & Zone</th>
                <th className="px-4 py-3">Active Pupils</th>
                <th className="px-4 py-3">Championship Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SCHOOL_LEAGUE_TABLE.map((item) => (
                <tr
                  key={item.rank}
                  className={`hover:bg-slate-50 transition-colors ${
                    item.rank === 1 ? 'bg-amber-50/40 font-semibold' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                        item.rank === 1
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : item.rank === 2
                          ? 'bg-slate-300 text-slate-800'
                          : item.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {item.schoolName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.city}, {item.zone}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.activePupils} Pupils
                  </td>
                  <td className="px-4 py-3 font-black text-emerald-800 font-display text-sm">
                    {item.score.toLocaleString()} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Class Challenge Creator Modal */}
      {showCreateChallenge && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                Create Class Challenge Derby
              </h3>
              <button
                onClick={() => setShowCreateChallenge(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Set up a timed live competition between Primary 6A and Primary 6B to drive energetic classroom engagement.
            </p>

            <form onSubmit={handleLaunchChallenge} className="space-y-4 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Subject Focus:
                </label>
                <select
                  value={challengeSubject}
                  onChange={(e) => setChallengeSubject(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-emerald-600"
                >
                  <option value="Mathematics">Mathematics (Fractions & Arithmetic)</option>
                  <option value="English Language">English Language (Grammar & Concord)</option>
                  <option value="Français">Français (Verbes & Vocabulaire)</option>
                  <option value="Science & Health">Science & Environmental Studies</option>
                  <option value="General Paper">Cameroon General Knowledge & Civics</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Question Count:
                  </label>
                  <input
                    type="number"
                    value={challengeQuestions}
                    onChange={(e) => setChallengeQuestions(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Duration (Minutes):
                  </label>
                  <input
                    type="number"
                    value={challengeDuration}
                    onChange={(e) => setChallengeDuration(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium">
                Example: Primary 6A vs Primary 6B Mathematics Challenge (30 questions in 20 minutes). Pupils receive instant live leaderboard standings.
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Launch Class Challenge Now
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
