'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CameroonMap } from './components/CameroonMap';
import { MissionPlayer } from './components/MissionPlayer';
import { ExamSimulation } from './components/ExamSimulation';
import { AITutorView } from './components/AITutorView';
import { ParentDashboard } from './components/ParentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AvatarCustomizer } from './components/AvatarCustomizer';
import { LocationMission, PupilProfile, ExamResult, MistakeRecord } from './types';
import { playClickSound, playCoinSound } from './utils/audio';

const STORAGE_KEY_PROFILE = 'mboaedu_pupil_profile_v1';
const STORAGE_KEY_EXAM = 'mboaedu_latest_exam_v1';

const INITIAL_PROFILE: PupilProfile = {
  name: 'Michael Ndive',
  schoolName: "St. Joseph's Boys Primary School, Buea",
  gradeClass: 'Primary 6 / Class 7 (Common Entrance Year)',
  level: 4,
  xp: 1450,
  coins: 650,
  streakDays: 8,
  avatarOutfit: 'toghu',
  activeTitle: 'Master of Mount Cameroon',
  completedMissionIds: ['mission-buea'],
  unlockedBadges: ['Mount Fako Pioneer', 'Limbe Ocean Mariner'],
  unlockedTools: ['Mount Fako Volcanic Magnifier', 'Grassfield Abacus'],
  errorHistory: [
    {
      id: 'initial-err-1',
      timestamp: Date.now() - 3600000 * 5,
      question: 'Calculate: 3/4 + 1/2',
      studentAnswer: '4/6',
      correctAnswer: '5/4 (or 1 1/4)',
      subject: 'mathematics',
      topic: 'Fractions Addition',
      diagnosis:
        'Cognitive error: You added numerators and denominators straight across (3+1=4, 4+2=6). Fractions require a common denominator.',
    },
    {
      id: 'initial-err-2',
      timestamp: Date.now() - 3600000 * 2,
      question: 'Complete: "Hier, nous ______ visité le Mont Cameroun."',
      studentAnswer: 'avons',
      correctAnswer: 'avons',
      subject: 'french',
      topic: 'Passé Composé Conjugation',
      diagnosis: 'Review auxiliary verbs (avoir vs être) in passé composé.',
    },
  ],
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'map' | 'exam' | 'tutor' | 'parent' | 'teacher' | 'avatar'
  >('map');
  const [activeMission, setActiveMission] = useState<LocationMission | null>(null);
  const [activeMistakeForTutor, setActiveMistakeForTutor] = useState<MistakeRecord | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load / Save Profile
  const [profile, setProfile] = useState<PupilProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved profile:', e);
    }
    return INITIAL_PROFILE;
  });

  const [latestExamResult, setLatestExamResult] = useState<ExamResult | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXAM);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved exam result:', e);
    }
    return null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Could not save profile to localStorage:', e);
    }
  }, [profile]);

  useEffect(() => {
    if (latestExamResult) {
      try {
        localStorage.setItem(STORAGE_KEY_EXAM, JSON.stringify(latestExamResult));
      } catch (e) {
        console.warn('Could not save exam result:', e);
      }
    }
  }, [latestExamResult]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleToggleOnline = () => {
    playClickSound();
    setIsOnline((prev) => {
      const next = !prev;
      showToast(
        next
          ? 'Connected to Network: Synchronized local progress to school cloud server!'
          : 'Switched to Offline Mode: All questions and local audio cached for study without internet!'
      );
      return next;
    });
  };

  const handleLaunchMission = (mission: LocationMission) => {
    setActiveMission(mission);
  };

  const handleMissionComplete = (
    missionId: string,
    badgeId: string,
    coinsEarned: number,
    xpEarned: number,
    newErrors: MistakeRecord[]
  ) => {
    setProfile((prev) => {
      const updatedMissions = prev.completedMissionIds.includes(missionId)
        ? prev.completedMissionIds
        : [...prev.completedMissionIds, missionId];

      const missionObj = activeMission;
      const updatedBadges =
        missionObj && !prev.unlockedBadges.includes(missionObj.badgeName)
          ? [...prev.unlockedBadges, missionObj.badgeName]
          : prev.unlockedBadges;

      const newXP = prev.xp + xpEarned;
      const newLevel = Math.floor(newXP / 400) + 1;

      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        xp: newXP,
        level: Math.max(prev.level, newLevel),
        completedMissionIds: updatedMissions,
        unlockedBadges: updatedBadges,
        errorHistory: [...prev.errorHistory, ...newErrors],
      };
    });

    showToast(`Mission Completed! +${coinsEarned} FCFA Coins & Badge Unlocked!`);
  };

  const handleSaveExamResult = (result: ExamResult, newErrors: MistakeRecord[]) => {
    setLatestExamResult(result);
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + 100,
      xp: prev.xp + 250,
      errorHistory: [...prev.errorHistory, ...newErrors],
    }));
    showToast(`Exam Answer Sheet Submitted! Overall Score: ${result.overallPercentage}%`);
  };

  const handleOpenAITutorForMistake = (mistake: MistakeRecord) => {
    setActiveMistakeForTutor(mistake);
    setActiveMission(null);
    setCurrentTab('tutor');
  };

  const handleAddCoins = (amount: number) => {
    playCoinSound();
    setProfile((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));
    showToast(`+${amount} FCFA Coins added for mastering drill!`);
  };

  const handleUpdateProfile = (updated: Partial<PupilProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    showToast('Scholar Profile and Attire Saved!');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setActiveMission(null);
          setCurrentTab(tab);
        }}
        profile={profile}
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeMission ? (
          <MissionPlayer
            mission={activeMission}
            profile={profile}
            onExit={() => setActiveMission(null)}
            onMissionComplete={handleMissionComplete}
            onOpenAITutorForMistake={handleOpenAITutorForMistake}
          />
        ) : (
          <>
            {currentTab === 'map' && (
              <CameroonMap
                profile={profile}
                onLaunchMission={handleLaunchMission}
              />
            )}

            {currentTab === 'exam' && (
              <ExamSimulation
                profile={profile}
                onSaveExamResult={handleSaveExamResult}
                onOpenAITutorForMistake={handleOpenAITutorForMistake}
              />
            )}

            {currentTab === 'tutor' && (
              <AITutorView
                profile={profile}
                activeMistake={activeMistakeForTutor}
                onClearActiveMistake={() => setActiveMistakeForTutor(null)}
                onAddCoins={handleAddCoins}
              />
            )}

            {currentTab === 'parent' && (
              <ParentDashboard
                profile={profile}
                latestExamResult={latestExamResult}
                onNavigateToMap={() => setCurrentTab('map')}
              />
            )}

            {currentTab === 'teacher' && <TeacherDashboard />}

            {currentTab === 'avatar' && (
              <AvatarCustomizer
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">MboaEdu Cameroon</span>
            <span>•</span>
            <span>Official Common Entrance & FSLC Digital Learning World</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>10 Regions Curriculum Syllabus</span>
            <span>•</span>
            <span>Bilingual (English & Français)</span>
            <span>•</span>
            <span>Offline-Ready PWA Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
