import React, { useState, useEffect } from 'react';
import {
  Compass,
  FileCheck2,
  Brain,
  Users,
  School,
  Sparkles,
  Flame,
  Coins,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { PupilProfile } from '../types';
import { playClickSound } from '../utils/audio';
import { BgmSoundSelector } from './BgmSoundSelector';

interface NavbarProps {
  currentTab: 'map' | 'exam' | 'tutor' | 'parent' | 'teacher' | 'avatar';
  onSelectTab: (tab: 'map' | 'exam' | 'tutor' | 'parent' | 'teacher' | 'avatar') => void;
  profile: PupilProfile;
  isOnline: boolean;
  onToggleOnline: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  isOnline,
  onToggleOnline,
}) => {
  const handleTabClick = (tab: 'map' | 'exam' | 'tutor' | 'parent' | 'teacher' | 'avatar') => {
    playClickSound();
    onSelectTab(tab);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro bar: Cameroon flag strip & status */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-emerald-600" />
        <div className="h-full w-1/3 bg-red-600 relative flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-yellow-400 rotate-45" />
        </div>
        <div className="h-full w-1/3 bg-amber-400" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Platform Name */}
          <div
            id="nav-logo-btn"
            onClick={() => handleTabClick('map')}
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl font-black">M</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 font-display">
                  Mboa<span className="text-emerald-600">Edu</span>
                </span>
                <span className="text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Cameroon
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Common Entrance & FSLC Quest
              </p>
            </div>
          </div>

          {/* Player stats bar: Coins, Streak, Chill Music Player, Offline sync toggle */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Soundscapes & BG Sounds Switcher */}
            <BgmSoundSelector compact />

            {/* FCFA Coins */}
            <div
              id="stat-coins-badge"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-semibold"
              title="FCFA Franc Coins earned from mission learning"
            >
              <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>{profile.coins.toLocaleString()} FCFA</span>
            </div>

            {/* Streak */}
            <div
              id="stat-streak-badge"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 font-semibold"
              title="Consecutive daily study streak"
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />
              <span>{profile.streakDays}d Streak</span>
            </div>

            {/* Offline sync toggle simulator */}
            <button
              id="sync-status-btn"
              onClick={onToggleOnline}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors ${
                isOnline
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
              }`}
              title="Click to toggle offline mode simulation"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">Online Sync</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden md:inline">Offline-Ready</span>
                </>
              )}
            </button>

            {/* Avatar Pill */}
            <button
              id="nav-avatar-btn"
              onClick={() => handleTabClick('avatar')}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {profile.name.charAt(0)}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-[11px] font-bold leading-tight truncate max-w-[90px]">
                  {profile.name}
                </p>
                <p className="text-[10px] text-slate-500">Lvl {profile.level}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 mt-2 pt-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
          <button
            id="tab-map-btn"
            onClick={() => handleTabClick('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'map'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Cameroon Map Quest</span>
          </button>

          <button
            id="tab-exam-btn"
            onClick={() => handleTabClick('exam')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'exam'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Common Entrance & FSLC</span>
          </button>

          <button
            id="tab-tutor-btn"
            onClick={() => handleTabClick('tutor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'tutor'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>AI Tutor: Explain My Mistake</span>
          </button>

          <button
            id="tab-parent-btn"
            onClick={() => handleTabClick('parent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'parent'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Parent Report</span>
          </button>

          <button
            id="tab-teacher-btn"
            onClick={() => handleTabClick('teacher')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'teacher'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Teacher & School League</span>
          </button>

          <button
            id="tab-avatar-btn"
            onClick={() => handleTabClick('avatar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'avatar'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Locker & Uniforms</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
