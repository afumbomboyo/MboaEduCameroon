import React, { useEffect, useState } from 'react';
import {
  BgmTrack,
  BGM_TRACKS,
  getCurrentBgmTrack,
  switchBgmTrack,
  nextBgmTrack,
  prevBgmTrack,
  toggleBackgroundMusic,
  subscribeToMusicState,
  subscribeToBgmTrack,
  getMusicVolume,
  setMusicVolume,
} from '../utils/audio';
import { Volume2, VolumeX, SkipBack, SkipForward, Music } from 'lucide-react';

interface BgmSoundSelectorProps {
  compact?: boolean;
  className?: string;
}

export const BgmSoundSelector: React.FC<BgmSoundSelectorProps> = ({
  compact = false,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<BgmTrack>(getCurrentBgmTrack());
  const [volume, setVolume] = useState(getMusicVolume());
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  useEffect(() => {
    const unsubMusic = subscribeToMusicState((playing) => setIsPlaying(playing));
    const unsubTrack = subscribeToBgmTrack((track) => setCurrentTrack(track));
    return () => {
      unsubMusic();
      unsubTrack();
    };
  }, []);

  const handleToggle = () => {
    toggleBackgroundMusic();
  };

  const handleNext = () => {
    nextBgmTrack();
    if (!isPlaying) {
      toggleBackgroundMusic();
    }
  };

  const handlePrev = () => {
    prevBgmTrack();
    if (!isPlaying) {
      toggleBackgroundMusic();
    }
  };

  const handleSelectTrack = (trackId: string) => {
    switchBgmTrack(trackId);
    if (!isPlaying) {
      toggleBackgroundMusic();
    }
    setIsOpenMenu(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMusicVolume(val);
  };

  if (compact) {
    return (
      <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
        <button
          onClick={handleToggle}
          title={isPlaying ? 'Pause Background Sounds' : 'Play Background Sounds'}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
            isPlaying
              ? 'bg-purple-600 hover:bg-purple-700 text-white ring-2 ring-purple-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-purple-200" />
              <span className="truncate max-w-[110px]">{currentTrack.icon} {currentTrack.name}</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span>BG Sounds</span>
            </>
          )}
        </button>

        {/* Quick next track arrow */}
        <button
          onClick={handleNext}
          title="Switch to Next Soundscape"
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      id="cameroon-bgm-soundscape-panel"
      className={`rounded-2xl bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 p-3 text-white shadow-xl ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Track Info & Visualizer */}
        <div className="flex items-center gap-2.5 min-w-[200px]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-emerald-600 flex items-center justify-center text-lg shadow-inner shrink-0">
            {currentTrack.icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                {currentTrack.category}
              </span>
              {isPlaying && (
                <span className="flex items-center gap-0.5 h-2">
                  <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-0.5 h-3 bg-purple-300 rounded-full animate-pulse" />
                  <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce" />
                </span>
              )}
            </div>
            <p className="text-xs font-black text-slate-100 truncate mt-0.5">
              {currentTrack.name}
            </p>
            <p className="text-[10px] text-slate-400 truncate max-w-[230px]">
              {currentTrack.tagline}
            </p>
          </div>
        </div>

        {/* Playback Controls & Track Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            title="Previous Soundscape"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            id="bgm-play-pause-btn"
            onClick={handleToggle}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
              isPlaying
                ? 'bg-purple-600 hover:bg-purple-500 text-white ring-2 ring-purple-400/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40'
            }`}
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Play Soundscape</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            title="Next Soundscape"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsOpenMenu(!isOpenMenu)}
            title="All Background Sounds"
            className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
              isOpenMenu
                ? 'bg-emerald-600 border-emerald-400 text-white'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sounds ({BGM_TRACKS.length})</span>
          </button>
        </div>
      </div>

      {/* Track Selection Drawer / Grid */}
      {isOpenMenu && (
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Choose Background Atmosphere:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {BGM_TRACKS.map((track) => {
              const active = currentTrack.id === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => handleSelectTrack(track.id)}
                  className={`p-2.5 rounded-xl text-left transition-all border flex items-start gap-2.5 cursor-pointer ${
                    active
                      ? 'bg-emerald-950/80 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                      : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{track.icon}</span>
                  <div className="truncate">
                    <p className="text-xs font-bold truncate text-slate-100">
                      {track.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {track.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Volume Slider */}
          <div className="pt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
            <span className="text-[11px] font-semibold">Sound Volume:</span>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-36 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
