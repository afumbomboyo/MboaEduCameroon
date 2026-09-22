import React, { useState } from 'react';
import { MistakeRecord, PupilProfile } from '../types';
import {
  Brain,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import {
  playClickSound,
  playCorrectSound,
  playIncorrectSound,
} from '../utils/audio';

interface AITutorViewProps {
  profile: PupilProfile;
  activeMistake?: MistakeRecord | null;
  onClearActiveMistake: () => void;
  onAddCoins: (amount: number) => void;
}

interface DrillQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  profile,
  activeMistake,
  onClearActiveMistake,
  onAddCoins,
}) => {
  const [selectedError, setSelectedError] = useState<MistakeRecord | null>(
    activeMistake || (profile.errorHistory.length > 0 ? profile.errorHistory[profile.errorHistory.length - 1] : null)
  );
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [isLoading, setIsLoading] = useState(false);

  // Diagnosis states
  const [diagnosis, setDiagnosis] = useState<{
    mistakeDiagnosis: string;
    stepByStepGuidance: string;
    goldenRule: string;
    drillQuestions: DrillQuestion[];
  } | null>(null);

  // Interactive drill practice answers
  const [drillAnswers, setDrillAnswers] = useState<Record<number, number>>({});
  const [drillVerified, setDrillVerified] = useState<Record<number, boolean>>({});

  const handleSelectMistake = async (err: MistakeRecord) => {
    playClickSound();
    setSelectedError(err);
    setDrillAnswers({});
    setDrillVerified({});
    await fetchDiagnosis(err);
  };

  const fetchDiagnosis = async (err: MistakeRecord) => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/tutor/explain-mistake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: err.question,
          studentAnswer: err.studentAnswer,
          correctAnswer: err.correctAnswer,
          subject: err.subject,
          topic: err.topic,
          language,
        }),
      });

      const data = await resp.json();
      if (data && data.success) {
        setDiagnosis({
          mistakeDiagnosis: data.mistakeDiagnosis,
          stepByStepGuidance: data.stepByStepGuidance,
          goldenRule: data.goldenRule,
          drillQuestions: data.drillQuestions || [],
        });
      }
    } catch {
      // Offline / Network fallback so child is never left with an empty screen
      setDiagnosis({
        mistakeDiagnosis: `You selected "${err.studentAnswer}", whereas the syllabus answer is "${err.correctAnswer}".`,
        stepByStepGuidance: `Let's break down why "${err.correctAnswer}" is the correct solution. Review each word in the problem, eliminate the most unlikely choices first, and verify units or calculation steps before marking your sheet.`,
        goldenRule: "Always re-read the exact question and check your work before handing in your paper!",
        drillQuestions: [
          {
            question: `Practice Review: ${err.question}`,
            options: [String(err.correctAnswer), String(err.studentAnswer), "Both A and B", "None of the above"],
            correctIndex: 0,
            hint: `Remember the correct target: ${err.correctAnswer}`,
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If initial load and selectedError exists, trigger diagnosis if not yet loaded
  React.useEffect(() => {
    if (selectedError && !diagnosis && !isLoading) {
      fetchDiagnosis(selectedError);
    }
  }, [selectedError]);

  const handleSelectDrillOption = (qIdx: number, optIdx: number) => {
    playClickSound();
    setDrillAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleVerifyDrill = (qIdx: number, correctIdx: number) => {
    const isCorrect = drillAnswers[qIdx] === correctIdx;
    setDrillVerified((prev) => ({ ...prev, [qIdx]: true }));

    if (isCorrect) {
      playCorrectSound();
      onAddCoins(30);
    } else {
      playIncorrectSound();
    }
  };

  return (
    <div className="max-w-4xl xl:max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-700/60 border border-purple-500/40 text-xs font-semibold text-purple-200">
            <Brain className="w-3.5 h-3.5 text-amber-300" />
            <span>Cameroon AI Tutor: "Explain My Mistake" Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-display tracking-tight">
            Turn Every Error into Exam Mastery
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm leading-relaxed">
            Instead of simply marking an answer as "WRONG", Tutor Koko analyzes the exact cognitive cause of the mistake, breaks down the solution step-by-step with real-world examples, and generates targeted drill questions so you never make that mistake again!
          </p>

          <div className="pt-2 flex items-center gap-3">
            <span className="text-xs text-purple-300 font-semibold">Tutor Language:</span>
            <div className="inline-flex p-1 rounded-lg bg-purple-950/60 border border-purple-700/60 text-xs font-bold">
              <button
                onClick={() => {
                  playClickSound();
                  setLanguage('en');
                  if (selectedError) fetchDiagnosis(selectedError);
                }}
                className={`px-3 py-1 rounded-md transition-colors ${
                  language === 'en' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setLanguage('fr');
                  if (selectedError) fetchDiagnosis(selectedError);
                }}
                className={`px-3 py-1 rounded-md transition-colors ${
                  language === 'fr' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:text-white'
                }`}
              >
                Français
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Recent Mistakes History sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>Study Error Log</span>
            </h2>
            <span className="text-[10px] font-bold text-slate-500">
              {profile.errorHistory.length} Recorded
            </span>
          </div>

          {profile.errorHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No mistakes logged yet!</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Play Cameroon map missions or take mock tests. Any mistakes will be cataloged here for guided mastery.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {profile.errorHistory.map((err) => {
                const isSelected = selectedError?.id === err.id;
                return (
                  <button
                    key={err.id}
                    onClick={() => handleSelectMistake(err)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 border-purple-500 text-purple-950 font-bold ring-2 ring-purple-500/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-extrabold text-[10px] uppercase text-purple-700">
                        {err.subject}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {new Date(err.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-semibold line-clamp-2 mt-1 text-slate-900">
                      {err.question}
                    </p>
                    <p className="text-[11px] text-red-600 mt-1 truncate">
                      Gave: "{err.studentAnswer}"
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick preset demo problem: "3/4 + 1/2 = 4/6" */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 mb-2">Try Classic Common Entrance Error:</p>
            <button
              onClick={() => {
                const demoErr: MistakeRecord = {
                  id: 'demo-fractions',
                  timestamp: Date.now(),
                  question: 'Calculate: 3/4 + 1/2',
                  studentAnswer: '4/6',
                  correctAnswer: '5/4 (or 1 1/4)',
                  subject: 'mathematics',
                  topic: 'Fractions Addition',
                  diagnosis: 'Added numerators and denominators straight across.',
                };
                handleSelectMistake(demoErr);
              }}
              className="w-full text-left p-2.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-950 text-xs font-semibold transition-colors cursor-pointer"
            >
              📐 Fractions: 3/4 + 1/2 = 4/6
            </button>
          </div>
        </div>

        {/* Diagnosis & Scaffolding workspace */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-6">
          {selectedError ? (
            <div className="space-y-6">
              {/* Problem details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                    {selectedError.subject} • {selectedError.topic}
                  </span>
                  <span className="text-xs text-slate-500">Curriculum Error Analysis</span>
                </div>

                <div className="text-sm sm:text-base font-bold text-slate-900 pt-1">
                  "{selectedError.question}"
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md font-medium">
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    <span>Pupil Answered: <strong>{selectedError.studentAnswer}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Correct Answer: <strong>{selectedError.correctAnswer}</strong></span>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="p-8 text-center space-y-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <Brain className="w-10 h-10 text-purple-600 animate-bounce mx-auto" />
                  <p className="text-xs font-bold text-purple-900">
                    Tutor Koko is analyzing the error reasoning...
                  </p>
                  <p className="text-[11px] text-purple-700">
                    Constructing pedagogical breakdown and follow-up drill questions.
                  </p>
                </div>
              ) : diagnosis ? (
                <div className="space-y-5">
                  {/* Step 1: Why the mistake happened */}
                  <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
                    <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs uppercase tracking-wide">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Why You Made This Mistake</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed pt-1">
                      {diagnosis.mistakeDiagnosis}
                    </p>
                  </div>

                  {/* Step 2: Step-by-step guidance */}
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                    <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wide">
                      <Lightbulb className="w-4 h-4 text-indigo-600" />
                      <span>Tutor Koko's Step-by-Step Guidance</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pt-1 whitespace-pre-line">
                      {diagnosis.stepByStepGuidance}
                    </p>
                  </div>

                  {/* Step 3: Golden Rule */}
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-bold text-xs flex items-start gap-2 shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="uppercase text-[10px] tracking-wide text-amber-800 block">
                        Golden Examination Rule:
                      </span>
                      <span>{diagnosis.goldenRule}</span>
                    </div>
                  </div>

                  {/* Step 4: Follow-up Practice Drills */}
                  {diagnosis.drillQuestions && diagnosis.drillQuestions.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Immediate Mastery Practice Drills</span>
                        </h3>
                        <span className="text-[11px] text-amber-700 font-bold">
                          +30 FCFA per correct drill!
                        </span>
                      </div>

                      <div className="space-y-4">
                        {diagnosis.drillQuestions.map((dq, qIdx) => {
                          const userSelected = drillAnswers[qIdx];
                          const isVerified = drillVerified[qIdx];
                          const isDrillCorrect = userSelected === dq.correctIndex;

                          return (
                            <div
                              key={qIdx}
                              className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs"
                            >
                              <div className="text-xs sm:text-sm font-bold text-slate-900">
                                {qIdx + 1}. {dq.question}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {dq.options.map((opt, optIdx) => {
                                  const isOptionSelected = userSelected === optIdx;
                                  let style = 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800';

                                  if (isOptionSelected) {
                                    style = 'border-purple-600 bg-purple-50 text-purple-950 font-bold';
                                  }

                                  if (isVerified) {
                                    if (optIdx === dq.correctIndex) {
                                      style = 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold';
                                    } else if (isOptionSelected && !isDrillCorrect) {
                                      style = 'border-red-500 bg-red-50 text-red-950';
                                    }
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => handleSelectDrillOption(qIdx, optIdx)}
                                      disabled={isVerified}
                                      className={`text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center gap-2 cursor-pointer ${style}`}
                                    >
                                      <span className="w-5 h-5 rounded-xs border border-current flex items-center justify-center font-bold text-[10px] shrink-0">
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {!isVerified ? (
                                <button
                                  onClick={() => handleVerifyDrill(qIdx, dq.correctIndex)}
                                  disabled={userSelected === undefined}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                                >
                                  Check Drill Answer
                                </button>
                              ) : (
                                <div
                                  className={`p-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
                                    isDrillCorrect
                                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                                      : 'bg-red-50 text-red-900 border border-red-200'
                                  }`}
                                >
                                  {isDrillCorrect ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                      <span>Correct! +30 FCFA Coins added to wallet!</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 text-red-600" />
                                      <span>Hint: {dq.hint}</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Brain className="w-12 h-12 text-purple-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">
                Select an error from your study log
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click any error on the left or try the classic "3/4 + 1/2 = 4/6" sample problem to experience Tutor Koko's deep cognitive explanation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
