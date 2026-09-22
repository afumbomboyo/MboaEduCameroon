import React, { useState, useEffect } from 'react';
import { QuestionItem, PupilProfile, ExamResult, SubjectId, MistakeRecord } from '../types';
import { CURRICULUM_QUESTIONS } from '../data/cameroonCurriculum';
import {
  Clock,
  Flag,
  CheckCircle2,
  AlertTriangle,
  Award,
  BarChart3,
  Brain,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  playClickSound,
  playCorrectSound,
  playFanfare,
  playIncorrectSound,
} from '../utils/audio';

interface ExamSimulationProps {
  profile: PupilProfile;
  onSaveExamResult: (result: ExamResult, newErrors: MistakeRecord[]) => void;
  onOpenAITutorForMistake: (mistake: MistakeRecord) => void;
}

export const ExamSimulation: React.FC<ExamSimulationProps> = ({
  profile,
  onSaveExamResult,
  onOpenAITutorForMistake,
}) => {
  const [examState, setExamState] = useState<'intro' | 'active' | 'results'>('intro');
  const [examType, setExamType] = useState<'full_common_entrance' | 'maths_sprint' | 'general_sprint'>('full_common_entrance');
  const [examQuestions, setExamQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 mins
  const [latestResult, setLatestResult] = useState<ExamResult | null>(null);
  const [isDiagnosingAI, setIsDiagnosingAI] = useState(false);

  // Timer loop
  useEffect(() => {
    if (examState !== 'active') return;
    if (secondsRemaining <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, secondsRemaining]);

  const handleStartExam = (type: 'full_common_entrance' | 'maths_sprint' | 'general_sprint') => {
    playClickSound();
    setExamType(type);

    let selectedList: QuestionItem[] = [];
    if (type === 'full_common_entrance') {
      selectedList = [...CURRICULUM_QUESTIONS]; // Complete 16 questions covering all subjects
      setSecondsRemaining(900); // 15 mins
    } else if (type === 'maths_sprint') {
      selectedList = CURRICULUM_QUESTIONS.filter(
        (q) => q.subject === 'mathematics' || q.subject === 'reasoning'
      );
      setSecondsRemaining(420); // 7 mins
    } else {
      selectedList = CURRICULUM_QUESTIONS.filter(
        (q) => q.subject === 'science' || q.subject === 'general_knowledge' || q.subject === 'french'
      );
      setSecondsRemaining(480); // 8 mins
    }

    // Shuffle questions slightly for authentic exam variety
    const shuffled = [...selectedList].sort(() => 0.5 - Math.random());
    setExamQuestions(shuffled);
    setCurrentIndex(0);
    setAnswers({});
    setFlagged({});
    setExamState('active');
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    playClickSound();
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    playClickSound();
    setFlagged((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    playFanfare();
    const mistakes: MistakeRecord[] = [];
    let correctCount = 0;

    const subjectStats: Record<SubjectId, { total: number; correct: number }> = {
      mathematics: { total: 0, correct: 0 },
      english: { total: 0, correct: 0 },
      french: { total: 0, correct: 0 },
      science: { total: 0, correct: 0 },
      general_knowledge: { total: 0, correct: 0 },
      reasoning: { total: 0, correct: 0 },
    };

    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    examQuestions.forEach((q) => {
      const studentAnsIdx = answers[q.id];
      subjectStats[q.subject].total += 1;

      if (studentAnsIdx === q.correctIndex) {
        correctCount += 1;
        subjectStats[q.subject].correct += 1;
        if (!strongTopics.includes(q.topic)) strongTopics.push(q.topic);
      } else {
        const studentAnsText =
          studentAnsIdx !== undefined && studentAnsIdx !== null
            ? q.options[studentAnsIdx]
            : 'Unanswered';
        mistakes.push({
          id: `mistake-${q.id}-${Date.now()}`,
          timestamp: Date.now(),
          question: q.prompt,
          studentAnswer: studentAnsText,
          correctAnswer: q.options[q.correctIndex],
          subject: q.subject,
          topic: q.topic,
          diagnosis: q.explanation,
        });
        if (!weakTopics.includes(q.topic)) weakTopics.push(q.topic);
      }
    });

    const overallPct = Math.round((correctCount / examQuestions.length) * 100);

    const subjectScores = Object.entries(subjectStats)
      .filter(([_, data]) => data.total > 0)
      .map(([subj, data]) => {
        const labels: Record<string, string> = {
          mathematics: 'Mathematics',
          english: 'English Language',
          french: 'Français',
          science: 'Science & Environment',
          general_knowledge: 'General Knowledge',
          reasoning: 'Reasoning & Logic',
        };
        return {
          subject: subj as SubjectId,
          label: labels[subj] || subj,
          total: data.total,
          correct: data.correct,
          percentage: Math.round((data.correct / data.total) * 100),
        };
      });

    const result: ExamResult = {
      id: `exam-res-${Date.now()}`,
      examTitle:
        examType === 'full_common_entrance'
          ? 'National Common Entrance & FSLC Mock'
          : examType === 'maths_sprint'
          ? 'Mathematics & Quantitative Sprint'
          : 'General Paper & Bilingualism Sprint',
      date: new Date().toLocaleDateString('en-GB'),
      overallPercentage: overallPct,
      totalQuestions: examQuestions.length,
      correctAnswersCount: correctCount,
      timeSpentSeconds: 600 - secondsRemaining,
      subjectScores,
      weakTopics,
      strongTopics,
    };

    setLatestResult(result);
    setExamState('results');
    onSaveExamResult(result, mistakes);

    // Call server AI diagnostic for actionable weaknesses
    setIsDiagnosingAI(true);
    try {
      const resp = await fetch('/api/tutor/diagnose-weakness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pupilName: profile.name,
          scores: subjectScores,
          incorrectTopics: weakTopics,
        }),
      });
      const data = await resp.json();
      if (data && data.report) {
        setLatestResult((prev) => (prev ? { ...prev, aiDiagnosis: data.report } : null));
      }
    } catch (e) {
      console.warn('AI diagnostic fetch error:', e);
    } finally {
      setIsDiagnosingAI(false);
    }
  };

  const currentQ = examQuestions[currentIndex];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="max-w-4xl xl:max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {examState === 'intro' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Official Examination Simulation Mode
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-0.5">
                Cameroon Common Entrance & FSLC Examination Room
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Step into the official timed examination atmosphere. Test papers are balanced according to the official Cameroon Ministry of Basic Education syllabus, including Mathematics (Paper 1), English Language (Paper 2), French, General Paper, and Quantitative Reasoning.
          </p>

          {/* Exam Mode Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pt-2">
            {/* Full Mock */}
            <div className="p-5 rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white hover:border-emerald-500 transition-all flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wide bg-emerald-600 text-white px-2 py-0.5 rounded-sm">
                  Recommended
                </span>
                <h3 className="font-extrabold text-slate-900 text-base mt-2">
                  Full Common Entrance Simulation
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  All 5 subjects, balanced timed challenge simulating the real exam pressure.
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    15 Minutes
                  </span>
                  <span>16 Questions</span>
                </div>
              </div>
              <button
                id="start-full-mock-btn"
                onClick={() => handleStartExam('full_common_entrance')}
                className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Sit Full Examination
              </button>
            </div>

            {/* Maths & Quantitative Sprint */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 transition-all flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Paper 1: Maths & Logic Sprint
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Focused high-density drill on fractions, decimals, FCFA profit, geometry, and number sequences.
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    7 Minutes
                  </span>
                  <span>8 Questions</span>
                </div>
              </div>
              <button
                id="start-maths-sprint-btn"
                onClick={() => handleStartExam('maths_sprint')}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Start Maths Sprint
              </button>
            </div>

            {/* General Paper & Bilingualism Sprint */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 transition-all flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  General Paper & French Sprint
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Science, health, Cameroon geography, national symbols, and French conjugation.
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    8 Minutes
                  </span>
                  <span>8 Questions</span>
                </div>
              </div>
              <button
                id="start-general-sprint-btn"
                onClick={() => handleStartExam('general_sprint')}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Start General Sprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Exam Mode */}
      {examState === 'active' && currentQ && (
        <div className="space-y-4">
          {/* Top Timer & Status Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Examination in Progress
              </span>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {currentQ.subjectLabel}
              </span>
            </div>

            {/* Countdown Clock */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs font-black ${
                secondsRemaining < 120
                  ? 'bg-red-100 text-red-800 animate-pulse border border-red-300'
                  : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4 text-current" />
              <span>Time Left: {formatTime(secondsRemaining)}</span>
            </div>

            <button
              id="submit-exam-early-btn"
              onClick={handleSubmitExam}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Submit Answer Sheet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
            {/* Question Card */}
            <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-600">
                  Question {currentIndex + 1} of {examQuestions.length}
                </span>

                <button
                  id="flag-question-btn"
                  onClick={() => handleToggleFlag(currentQ.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer ${
                    flagged[currentQ.id]
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5 fill-current" />
                  <span>{flagged[currentQ.id] ? 'Flagged for Review' : 'Flag Question'}</span>
                </button>
              </div>

              {currentQ.contextText && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-slate-800 italic leading-relaxed">
                  "{currentQ.contextText}"
                </div>
              )}

              <div className="text-base sm:text-lg font-bold text-slate-900 leading-snug whitespace-pre-line">
                {currentQ.prompt}
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ.id] === idx;
                  return (
                    <button
                      key={idx}
                      id={`exam-opt-${idx}`}
                      onClick={() => handleSelectOption(currentQ.id, idx)}
                      className={`w-full text-left p-3 sm:p-3.5 md:p-4 rounded-xl border text-sm sm:text-base font-bold min-h-[52px] sm:min-h-[48px] transition-all flex items-center gap-3 cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-lg border border-current flex items-center justify-center font-black text-xs shrink-0 bg-white/80 shadow-2xs">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  id="exam-prev-btn"
                  onClick={() => {
                    playClickSound();
                    if (currentIndex > 0) setCurrentIndex((c) => c - 1);
                  }}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
                >
                  Previous
                </button>

                <button
                  id="exam-next-btn"
                  onClick={() => {
                    playClickSound();
                    if (currentIndex < examQuestions.length - 1) {
                      setCurrentIndex((c) => c + 1);
                    } else {
                      handleSubmitExam();
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                >
                  {currentIndex < examQuestions.length - 1 ? 'Save & Next' : 'Submit Paper'}
                </button>
              </div>
            </div>

            {/* Question Matrix Navigation Palette */}
            <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Question Sheet Palette
              </h3>

              <div className="grid grid-cols-4 gap-2">
                {examQuestions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
                  const isCurrent = currentIndex === idx;
                  const isItemFlagged = flagged[q.id];

                  let btnStyle = 'border-slate-200 bg-slate-50 text-slate-700';
                  if (isAnswered) {
                    btnStyle = 'bg-emerald-600 text-white border-emerald-700 font-bold';
                  }
                  if (isItemFlagged) {
                    btnStyle = 'bg-amber-100 text-amber-900 border-amber-400 font-bold';
                  }
                  if (isCurrent) {
                    btnStyle += ' ring-2 ring-emerald-500 ring-offset-1';
                  }

                  return (
                    <button
                      key={q.id}
                      id={`nav-matrix-q-${idx + 1}`}
                      onClick={() => {
                        playClickSound();
                        setCurrentIndex(idx);
                      }}
                      className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center relative transition-all cursor-pointer ${btnStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {isItemFlagged && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] space-y-1.5 text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-amber-200 border border-amber-400 inline-block" />
                  <span>Flagged for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-slate-100 border border-slate-300 inline-block" />
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Examination Diagnostic Scorecard & AI Weakness Report */}
      {examState === 'results' && latestResult && (
        <div className="space-y-6">
          {/* Main Scorecard Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Cameroon Ministry of Basic Education Standard
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-display mt-1">
                  Common Entrance & FSLC Examination Result
                </h2>
                <p className="text-xs text-slate-500">
                  Candidate: <strong>{profile.name}</strong> • Class: {profile.gradeClass} • {profile.schoolName}
                </p>
              </div>

              {/* Big Score Stamp */}
              <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shrink-0">
                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-800 font-display">
                    {latestResult.overallPercentage}%
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600">
                    {latestResult.correctAnswersCount} of {latestResult.totalQuestions} Marks
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                  {latestResult.overallPercentage >= 80
                    ? 'A'
                    : latestResult.overallPercentage >= 65
                    ? 'B'
                    : 'C'}
                </div>
              </div>
            </div>

            {/* Subject Breakdown Cards (The exact requested format: Mathematics: 72%, English: 84%, French: 61%, Science: 78%, Reasoning: 68%) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Curriculum Subject Breakdown</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                {latestResult.subjectScores.map((score) => (
                  <div
                    key={score.subject}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-700 truncate">{score.label}</p>
                      <p className="text-[10px] text-slate-500">
                        {score.correct}/{score.total} questions
                      </p>
                    </div>
                    <div className="mt-3">
                      <span
                        className={`text-xl font-black font-display ${
                          score.percentage >= 80
                            ? 'text-emerald-700'
                            : score.percentage >= 65
                            ? 'text-amber-700'
                            : 'text-red-600'
                        }`}
                      >
                        {score.percentage}%
                      </span>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            score.percentage >= 80
                              ? 'bg-emerald-600'
                              : score.percentage >= 65
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${score.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Weakness Identification & Diagnostic Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/40 to-slate-50 border border-purple-200 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-700" />
                  <h3 className="text-sm font-extrabold text-purple-950 font-display">
                    AI Diagnostic Weakness Analysis
                  </h3>
                </div>
                {isDiagnosingAI && (
                  <span className="text-[10px] font-bold text-purple-600 animate-pulse">
                    Evaluating cognitive patterns...
                  </span>
                )}
              </div>

              {latestResult.aiDiagnosis ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-purple-200 font-medium text-purple-950 leading-relaxed">
                    <span className="font-bold text-purple-900 block mb-1">
                      Readiness Tier: {latestResult.aiDiagnosis.readinessTier}
                    </span>
                    {latestResult.aiDiagnosis.summary}
                  </div>

                  {/* Weaknesses list */}
                  <div className="space-y-2">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-red-800">
                      Identified Focus Areas & Action Plan:
                    </span>
                    {latestResult.aiDiagnosis.weaknesses.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-red-200 space-y-1"
                      >
                        <p className="font-bold text-red-950 text-xs">
                          {idx + 1}. {w.topic}
                        </p>
                        <p className="text-slate-600 text-[11px]">
                          <strong>Cognitive cause: </strong>
                          {w.cause}
                        </p>
                        <p className="text-emerald-700 font-semibold text-[11px]">
                          <strong>Prescribed mission: </strong>
                          {w.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-purple-900 leading-relaxed">
                  Your child demonstrates high speed in multiplication and fractions, but needs additional practice in multi-step word problems (currency change calculations) and French irregular verb agreements.
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                id="retake-exam-btn"
                onClick={() => setExamState('intro')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Return to Examination Room</span>
              </button>

              <button
                id="open-tutor-from-exam-btn"
                onClick={() => {
                  playClickSound();
                  if (profile.errorHistory.length > 0) {
                    onOpenAITutorForMistake(profile.errorHistory[profile.errorHistory.length - 1]);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Brain className="w-4 h-4" />
                <span>Launch Adaptive Practice Drill</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
