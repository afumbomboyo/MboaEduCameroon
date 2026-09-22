import React, { useState, useEffect } from 'react';
import { LocationMission, QuestionItem, PupilProfile, MistakeRecord } from '../types';
import { recordMissionResult } from '../../app/actions/gameActions';
import { motion, AnimatePresence } from 'motion/react';
import { ConfettiBurst } from './ConfettiBurst';
import { MascotCoach, MascotMood } from './MascotCoach';
import {
  readQuestionWithMe,
  stopReading,
  subscribeToReadingState,
  isSpeechSupported,
} from '../utils/speech';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  Coins,
  ArrowRight,
  Brain,
  Lightbulb,
  Volume2,
  Square,
  Flame,
  Star,
} from 'lucide-react';
import {
  playClickSound,
  playCorrectSound,
  playIncorrectSound,
  playCoinSound,
  playFanfare,
} from '../utils/audio';

interface MissionPlayerProps {
  mission: LocationMission;
  profile: PupilProfile;
  onExit: () => void;
  onMissionComplete: (
    missionId: string,
    badgeId: string,
    coinsEarned: number,
    xpEarned: number,
    newErrors: MistakeRecord[]
  ) => void;
  onOpenAITutorForMistake: (mistake: MistakeRecord) => void;
}

export const MissionPlayer: React.FC<MissionPlayerProps> = ({
  mission,
  profile,
  onExit,
  onMissionComplete,
  onOpenAITutorForMistake,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [missionMistakes, setMissionMistakes] = useState<MistakeRecord[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [confettiKey, setConfettiKey] = useState(0);
  const [serverActionResult, setServerActionResult] = useState<string | null>(null);

  // Speech "Read with me" state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechAvailable = isSpeechSupported();

  const currentQuestion: QuestionItem = mission.questions[currentIndex];
  const progressPercent = Math.round(
    ((currentIndex + (isAnswerSubmitted ? 1 : 0)) / mission.questions.length) * 100
  );

  useEffect(() => {
    const unsub = subscribeToReadingState((reading) => {
      setIsSpeaking(reading);
    });
    return () => {
      unsub();
      stopReading();
    };
  }, []);

  // Stop reading if question changes
  useEffect(() => {
    stopReading();
  }, [currentIndex]);

  const handleToggleReadWithMe = () => {
    playClickSound();
    if (isSpeaking) {
      stopReading();
    } else {
      readQuestionWithMe({
        prompt: currentQuestion.prompt,
        contextText: currentQuestion.contextText,
        options: currentQuestion.options,
      });
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    playClickSound();
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;

    // Stop speaking when submitting answer
    stopReading();

    const correct = selectedOption === currentQuestion.correctIndex;
    setIsCorrect(correct);
    setIsAnswerSubmitted(true);

    if (correct) {
      playCorrectSound();
      playCoinSound();
      setStreak((prev) => prev + 1);
      setConfettiKey((prev) => prev + 1);
    } else {
      playIncorrectSound();
      setStreak(0);
      const mistake: MistakeRecord = {
        id: `mistake-${Date.now()}-${currentIndex}`,
        timestamp: Date.now(),
        question: currentQuestion.prompt,
        studentAnswer: currentQuestion.options[selectedOption],
        correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
        subject: currentQuestion.subject,
        topic: currentQuestion.topic,
        diagnosis: currentQuestion.explanation,
      };
      setMissionMistakes((prev) => [...prev, mistake]);
    }
  };

  const handleNextQuestion = () => {
    playClickSound();
    stopReading();

    if (currentIndex < mission.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setIsCorrect(null);
      setShowHint(false);
    } else {
      // Completed all questions in the mission!
      setIsComplete(true);
      playFanfare();
      onMissionComplete(
        mission.id,
        mission.badgeId,
        mission.coinsReward,
        mission.xpReward,
        missionMistakes
      );

      // Trigger Next.js Server Action
      const correctAnswersCount = mission.questions.length - missionMistakes.length;
      recordMissionResult({
        missionId: mission.id,
        studentName: profile.name,
        score: Math.max(0, correctAnswersCount),
        totalQuestions: mission.questions.length,
        passed: correctAnswersCount >= Math.ceil(mission.questions.length * 0.5),
      })
        .then((res) => {
          if (res.success && res.data) {
            setServerActionResult(
              `⚡ Next.js Server Action: Verified (${res.data.serverValidationId.substring(0, 12)}) +${res.data.bonusXp} Server XP`
            );
          }
        })
        .catch((err) => {
          console.error('Failed to invoke Server Action:', err);
        });
    }
  };

  // Determine Mascot Mood & Message
  let mascotMood: MascotMood = 'idle';
  let mascotMessage = `Solve this challenge to earn points for ${mission.city}!`;

  if (isSpeaking) {
    mascotMood = 'reading';
    mascotMessage = 'Listen carefully as we read the question together!';
  } else if (isAnswerSubmitted && isCorrect) {
    mascotMood = 'celebrating';
    mascotMessage =
      streak > 1
        ? `🔥 Fantastic! Streak of ${streak} correct! You're on fire, ${profile.name.split(' ')[0]}!`
        : `Superbe! Brilliant thinking! +${currentQuestion.points} XP earned!`;
  } else if (isAnswerSubmitted && !isCorrect) {
    mascotMood = 'encouraging';
    mascotMessage = `Almost got it! Don't worry, every great scholar learns from mistakes. Let's inspect the explanation together!`;
  } else if (showHint) {
    mascotMood = 'thinking';
    mascotMessage = `Here's a golden tip from ${mission.guideName} to help you figure it out!`;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      {/* Festive Confetti Explosion on Correct Answer */}
      <ConfettiBurst triggerKey={confettiKey} />

      {/* Top Navigation & Mission Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-3">
          <button
            id="mission-exit-btn"
            onClick={() => {
              playClickSound();
              stopReading();
              onExit();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cameroon Map</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span>{mission.city}:</span>
            <span className="text-emerald-700 font-extrabold">{mission.title}</span>
          </div>

          <div className="flex items-center gap-3">
            {streak > 1 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.2, 1] }}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-black shadow-xs"
              >
                <Flame className="w-3.5 h-3.5 fill-white text-white animate-pulse" />
                <span>{streak} Streak!</span>
              </motion.div>
            )}

            <div className="text-xs font-bold text-slate-500">
              Question {currentIndex + 1} of {mission.questions.length}
            </div>
          </div>
        </div>

        {/* Progress track */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
          <motion.div
            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full shadow-xs"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {!isComplete ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x: isAnswerSubmitted && !isCorrect ? [-10, 10, -8, 8, -4, 4, 0] : 0,
            }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`bg-white rounded-3xl border-2 p-6 sm:p-8 shadow-sm space-y-6 transition-colors ${
              isAnswerSubmitted
                ? isCorrect
                  ? 'border-emerald-400 bg-emerald-50/10'
                  : 'border-red-300 bg-red-50/10'
                : 'border-slate-200'
            }`}
          >
            {/* Mascot Coach & Guide dialogue header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/40 border border-slate-200">
              <MascotCoach
                mood={mascotMood}
                speechText={mascotMessage}
                size="md"
                onTap={() => {
                  playClickSound();
                  handleToggleReadWithMe();
                }}
              />

              {/* READ WITH ME Prominent Audio Button */}
              {speechAvailable && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  id="mission-read-with-me-btn"
                  onClick={handleToggleReadWithMe}
                  className={`px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 ${
                    isSpeaking
                      ? 'bg-amber-500 text-white ring-4 ring-amber-200 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Stop Reading</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>🔊 Read With Me</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>

            {/* Speaking active animated banner indicator */}
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold"
              >
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-3 bg-amber-600 rounded-full animate-bounce" />
                  <span className="w-1.5 h-4 bg-amber-600 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
                <span>Reading with you aloud... Follow along with the words!</span>
              </motion.div>
            )}

            {/* Question Subject Badge & Topic */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-md border border-emerald-200">
                {currentQuestion.subjectLabel} • {currentQuestion.topic}
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                +{currentQuestion.points} XP
              </span>
            </div>

            {/* Context text if comprehension */}
            {currentQuestion.contextText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed italic ${
                  isSpeaking
                    ? 'bg-amber-100/70 border-amber-300 text-amber-950 ring-2 ring-amber-300/50'
                    : 'bg-amber-50/50 border-amber-200 text-slate-800'
                }`}
              >
                "{currentQuestion.contextText}"
              </motion.div>
            )}

            {/* Question Prompt */}
            <div
              className={`text-base sm:text-xl font-black leading-snug whitespace-pre-line transition-colors ${
                isSpeaking ? 'text-emerald-950 bg-emerald-50/60 p-2 rounded-xl' : 'text-slate-900'
              }`}
            >
              {currentQuestion.prompt}
            </div>

            {/* Options with high-energy spring animation */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((optionText, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOption = idx === currentQuestion.correctIndex;

                let optionStyle =
                  'border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-800 hover:border-slate-300';

                if (isSelected && !isAnswerSubmitted) {
                  optionStyle =
                    'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/30 scale-[1.01]';
                }

                if (isAnswerSubmitted) {
                  if (isCorrectOption) {
                    optionStyle =
                      'border-emerald-600 bg-emerald-100/80 text-emerald-950 font-black ring-4 ring-emerald-400/40 shadow-sm';
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle =
                      'border-red-500 bg-red-50 text-red-950 font-medium ring-2 ring-red-400/30';
                  } else {
                    optionStyle = 'opacity-40 border-slate-200 bg-slate-50 text-slate-600';
                  }
                }

                return (
                  <motion.button
                    key={idx}
                    id={`option-${idx}`}
                    whileHover={!isAnswerSubmitted ? { scale: 1.015, x: 2 } : {}}
                    whileTap={!isAnswerSubmitted ? { scale: 0.985 } : {}}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerSubmitted}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 text-sm cursor-pointer shadow-2xs ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl border border-current flex items-center justify-center font-black text-xs shrink-0 bg-white/70">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug">{optionText}</span>
                    </div>

                    {isAnswerSubmitted && isCorrectOption && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.3, 1] }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      </motion.div>
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrectOption && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                      >
                        <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Hint disclosure */}
            {!isAnswerSubmitted && (
              <div className="pt-1">
                {!showHint ? (
                  <button
                    id="show-hint-btn"
                    onClick={() => {
                      playClickSound();
                      setShowHint(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Need a hint from {mission.guideName}?</span>
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 shadow-2xs"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Guide Clue: </span>
                      <span>{currentQuestion.hint}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Feedback & Actions */}
            {!isAnswerSubmitted ? (
              <motion.button
                id="submit-answer-btn"
                whileHover={selectedOption !== null ? { scale: 1.02 } : {}}
                whileTap={selectedOption !== null ? { scale: 0.98 } : {}}
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className={`w-full py-4 px-4 rounded-2xl font-black text-sm transition-all cursor-pointer shadow-md ${
                  selectedOption !== null
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-teal-800'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                Verify Answer
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-2"
              >
                {/* Feedback banner */}
                <div
                  className={`p-4 rounded-2xl border-2 shadow-xs ${
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-red-50 border-red-300 text-red-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Magnifique! +{currentQuestion.points} XP & +50 FCFA Coins Earned!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span>Not quite right yet — Let's learn why!</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs mt-1.5 leading-relaxed text-slate-700 font-medium">
                    {currentQuestion.explanation}
                  </p>

                  {/* If incorrect: Explain My Mistake AI Button */}
                  {!isCorrect && (
                    <div className="mt-3 pt-3 border-t border-red-200/80 flex flex-wrap items-center justify-between gap-2">
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        id="explain-my-mistake-btn"
                        onClick={() => {
                          playClickSound();
                          const mistake: MistakeRecord = {
                            id: `mistake-${Date.now()}`,
                            timestamp: Date.now(),
                            question: currentQuestion.prompt,
                            studentAnswer: currentQuestion.options[selectedOption!],
                            correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
                            subject: currentQuestion.subject,
                            topic: currentQuestion.topic,
                            diagnosis: currentQuestion.explanation,
                          };
                          onOpenAITutorForMistake(mistake);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white text-xs font-black shadow-sm transition-all cursor-pointer ring-2 ring-red-300/40 animate-pulse"
                      >
                        <Brain className="w-4 h-4" />
                        <span>Ask AI Tutor: "Explain My Mistake" 💡</span>
                      </motion.button>

                      <span className="text-[11px] text-red-800 font-bold">
                        Understand the cognitive cause of this error
                      </span>
                    </div>
                  )}
                </div>

                {/* Continue button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  id="next-question-btn"
                  onClick={handleNextQuestion}
                  className="w-full py-4 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>
                    {currentIndex < mission.questions.length - 1
                      ? 'Next Challenge ➔'
                      : 'Complete Mission & Claim Rewards 🏆'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        /* Victory & Rewards Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border-2 border-emerald-400 p-8 shadow-xl text-center space-y-6"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-200 border-4 border-amber-300 flex items-center justify-center text-5xl shadow-md ring-8 ring-amber-100"
          >
            {mission.badgeIcon}
          </motion.div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black mb-2">
              <Trophy className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mission Conquered! 🇨🇲</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              {mission.city}: {mission.title} Completed!
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto mt-2 italic leading-relaxed">
              "{mission.storyOutro}"
            </p>
          </div>

          {/* Reward Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center shadow-2xs"
            >
              <p className="text-3xl">{mission.badgeIcon}</p>
              <p className="font-black text-xs text-amber-950 mt-1">
                {mission.badgeName}
              </p>
              <p className="text-[10px] text-amber-700 font-semibold">Cultural Crest</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center shadow-2xs"
            >
              <Coins className="w-7 h-7 text-emerald-600 mx-auto" />
              <p className="font-black text-xs text-emerald-950 mt-1">
                +{mission.coinsReward} FCFA
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold">Coins Added</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-center shadow-2xs"
            >
              <Sparkles className="w-7 h-7 text-sky-600 mx-auto" />
              <p className="font-black text-xs text-sky-950 mt-1">
                {mission.toolReward}
              </p>
              <p className="text-[10px] text-sky-700 font-semibold">Locker Tool</p>
            </motion.div>
          </div>

          {/* Mistakes summary if any */}
          {missionMistakes.length > 0 && (
            <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200 max-w-lg mx-auto text-left shadow-2xs">
              <p className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-orange-600" />
                <span>You have {missionMistakes.length} error(s) logged in your study log</span>
              </p>
              <p className="text-[11px] text-orange-800 mt-1">
                Our AI Tutor can explain the exact cognitive cause of these mistakes and provide practice drills to guarantee mastery.
              </p>
            </div>
          )}

          {/* Next.js Server Action verification banner */}
          {serverActionResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-medium shadow-sm max-w-md mx-auto"
            >
              <span>{serverActionResult}</span>
            </motion.div>
          )}

          {/* Return actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="return-map-btn"
              onClick={() => {
                playClickSound();
                onExit();
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all cursor-pointer hover:scale-105"
            >
              Continue Cameroon Journey 🗺️
            </button>

            {missionMistakes.length > 0 && (
              <button
                id="review-mistakes-tutor-btn"
                onClick={() => {
                  playClickSound();
                  onOpenAITutorForMistake(missionMistakes[0]);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Brain className="w-4 h-4 text-purple-700" />
                <span>Review Mistakes with AI Tutor</span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
