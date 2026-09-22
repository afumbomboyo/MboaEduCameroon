import React, { useState, useEffect } from 'react';
import { subscribeToSpeechState } from '../utils/speech';
import { RegionalGuide } from '../data/cameroonRegionalSites';
import { playClickSound } from '../utils/audio';

interface RegionalGuideAvatarProps {
  guide: RegionalGuide;
  currentSpeech?: string;
  isSpeaking: boolean;
  onReplaySpeech?: () => void;
  position?: { x: number; y: number };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RegionalGuideAvatar: React.FC<RegionalGuideAvatarProps> = ({
  guide,
  currentSpeech,
  isSpeaking: externalIsSpeaking,
  onReplaySpeech,
  position,
  size = 'md',
  className = '',
}) => {
  const [internalIsSpeaking, setInternalIsSpeaking] = useState(false);
  const [talkFrame, setTalkFrame] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [bounceFrame, setBounceFrame] = useState(0);

  const isSpeaking = externalIsSpeaking || internalIsSpeaking;
  const isFemale = guide.gender === 'female';

  useEffect(() => {
    const unsub = subscribeToSpeechState((speaking) => {
      setInternalIsSpeaking(speaking);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!isSpeaking) {
      setTalkFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setTalkFrame((prev) => (prev + 1) % 4);
    }, 110);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBounceFrame((prev) => (prev + 1) % 12);
    }, 280);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  const bounceOffsetY = Math.sin((bounceFrame / 12) * Math.PI * 2) * 3;
  const armSwing = isSpeaking ? Math.sin(talkFrame * 1.3) * 18 : Math.sin(bounceFrame * 0.8) * 8;
  const legSwing = isSpeaking ? (talkFrame % 2 === 0 ? 16 : -16) : Math.sin(bounceFrame * 0.6) * 6;
  const bobY = isSpeaking ? Math.sin((bounceFrame + talkFrame) * 0.8) * 3 : Math.sin((bounceFrame / 12) * Math.PI * 2) * 2.5;

  const sizeClasses =
    size === 'sm'
      ? 'w-14 h-16 sm:w-16 sm:h-18'
      : size === 'lg'
      ? 'w-32 h-36 sm:w-36 sm:h-40'
      : 'w-24 h-28 sm:w-28 sm:h-32';

  return (
    <div
      id="regional-guide-avatar-container"
      className={
        position
          ? `absolute z-20 transition-all duration-700 ease-out pointer-events-auto ${className}`
          : `relative transition-all duration-700 ease-out pointer-events-auto ${className}`
      }
      style={
        position
          ? {
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: `translate(-50%, -50%) translateY(${bounceOffsetY}px)`,
            }
          : {
              transform: `translateY(${bounceOffsetY}px)`,
            }
      }
    >
      {currentSpeech && (
        <div
          id="regional-guide-speech-bubble"
          className="absolute -top-3 sm:-top-6 left-1/2 -translate-x-1/2 -translate-y-full w-64 sm:w-80 bg-white/95 backdrop-blur-md text-slate-900 rounded-2xl p-3.5 shadow-2xl border-2 border-emerald-500/30 text-xs sm:text-sm font-medium z-30 transition-all duration-300 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold tracking-wide uppercase text-emerald-800">
                {guide.name} ({guide.gender === 'female' ? 'Guide • Elle' : 'Guide • Il'})
              </span>
            </div>

            {onReplaySpeech && (
              <button
                onClick={() => {
                  playClickSound();
                  onReplaySpeech();
                }}
                title="Click to replay voice"
                className="px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-semibold flex items-center gap-1 border border-emerald-200 transition-colors"
              >
                {isSpeaking ? (
                  <>
                    <span className="inline-block w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping" />
                    <span>Speaking...</span>
                  </>
                ) : (
                  <>
                    <span>🔊 Repeat</span>
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-slate-800 leading-snug font-medium text-xs sm:text-[13px]">
            {currentSpeech}
          </p>

          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white/95 drop-shadow" />
        </div>
      )}

      <div
        id="regional-guide-visual-card"
        onClick={() => {
          if (onReplaySpeech) {
            playClickSound();
            onReplaySpeech();
          }
        }}
        className="group relative cursor-pointer flex flex-col items-center select-none"
      >
        <div className="absolute inset-0 -m-2 rounded-full bg-emerald-400/20 blur-md group-hover:bg-emerald-400/35 transition-all" />

        <div className={`relative ${sizeClasses} drop-shadow-xl transition-transform group-hover:scale-105 duration-200`}>
          <svg viewBox="0 0 120 140" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={`guideSkin-${guide.name}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#784421" />
                <stop offset="100%" stopColor="#542e14" />
              </linearGradient>
              <linearGradient id={`guideGold-${guide.name}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
              <linearGradient id={`guideTunic-${guide.name}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isFemale ? '#0d9488' : '#0f766e'} />
                <stop offset="100%" stopColor={isFemale ? '#047857' : '#115e59'} />
              </linearGradient>
            </defs>

            <g transform={`translate(0 ${bobY})`}>
              <ellipse cx="60" cy="128" rx="26" ry="7" fill="#0f172a" fillOpacity="0.28" />

              <g>
                <path
                  d="M31 82 C31 62 42 54 60 54 C78 54 89 62 89 82 L93 122 L27 122 Z"
                  fill={`url(#guideTunic-${guide.name})`}
                />
                {isFemale ? (
                  <path d="M46 54 L60 70 L74 54 L76 122 L44 122 Z" fill="#f59e0b" opacity="0.8" />
                ) : (
                  <>
                    <path d="M48 54 L60 74 L72 54 Z" fill="#f8fafc" opacity="0.9" />
                    <circle cx="60" cy="94" r="4.5" fill="#fbbf24" />
                  </>
                )}
                <path d="M36 82 L46 122 M84 82 L74 122" stroke={`url(#guideGold-${guide.name})`} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
              </g>

              <g>
                <line x1="38" y1="86" x2="22" y2="108" stroke="#d97706" strokeWidth="6" strokeLinecap="round" transform={`rotate(${armSwing - 12} 38 86)`} />
                <line x1="82" y1="86" x2="98" y2="108" stroke="#d97706" strokeWidth="6" strokeLinecap="round" transform={`rotate(${armSwing + 12} 82 86)`} />
                <line x1="50" y1="122" x2="48" y2="136" stroke="#111827" strokeWidth="7" strokeLinecap="round" transform={`rotate(${legSwing} 50 122)`} />
                <line x1="70" y1="122" x2="72" y2="136" stroke="#111827" strokeWidth="7" strokeLinecap="round" transform={`rotate(${-legSwing} 70 122)`} />
              </g>

              <g>
                <ellipse cx="60" cy="42" rx="22" ry="24" fill={`url(#guideSkin-${guide.name})`} />
                <ellipse cx="36" cy="44" rx="4.5" ry="7" fill={`url(#guideSkin-${guide.name})`} />
                <ellipse cx="84" cy="44" rx="4.5" ry="7" fill={`url(#guideSkin-${guide.name})`} />

                {isFemale ? (
                  <>
                    <path d="M34 38 C34 16 46 10 60 10 C74 10 86 16 86 38 C78 30 71 28 60 28 C49 28 42 30 34 38 Z" fill="#0d9488" />
                    <path d="M38 22 Q60 5 82 22 Q60 18 38 22 Z" fill={`url(#guideGold-${guide.name})`} />
                    <circle cx="60" cy="18" r="4" fill="#f43f5e" />
                  </>
                ) : (
                  <>
                    <path d="M36 36 C36 20 46 14 60 14 C74 14 84 20 84 36 L90 40 L30 40 Z" fill="#1f2937" />
                    <polygon points="60,18 64,26 70,26 65,30 67,36 60,32 53,36 55,30 50,26 56,26" fill={`url(#guideGold-${guide.name})`} />
                  </>
                )}

                {isBlinking ? (
                  <>
                    <line x1="46" y1="46" x2="54" y2="46" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="66" y1="46" x2="74" y2="46" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <ellipse cx="49" cy="46" rx="4.5" ry="5" fill="#ffffff" />
                    <circle cx="49" cy="46" r="2.8" fill="#111827" />
                    <ellipse cx="71" cy="46" rx="4.5" ry="5" fill="#ffffff" />
                    <circle cx="71" cy="46" r="2.8" fill="#111827" />
                  </>
                )}

                <path d="M57 52 Q60 55 63 52" stroke="#542e14" strokeWidth="1.8" fill="none" strokeLinecap="round" />

                {isSpeaking ? (
                  talkFrame % 2 === 0 ? (
                    <g>
                      <ellipse cx="60" cy="62" rx="5.5" ry="4.5" fill="#3f1d14" />
                      <ellipse cx="60" cy="61" rx="4" ry="1.8" fill="#ffffff" />
                    </g>
                  ) : (
                    <g>
                      <ellipse cx="60" cy="62" rx="4.6" ry="2.6" fill="#3f1d14" />
                    </g>
                  )
                ) : (
                  <path d="M52 60 Q60 67 68 60" stroke="#3f1d14" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                )}
              </g>
            </g>
          </svg>
        </div>

        <div className="mt-1 px-3 py-1 rounded-full bg-slate-900/90 text-white shadow-lg border border-slate-700 flex items-center gap-1.5 backdrop-blur-sm">
          <span className="text-xs">{isFemale ? '👩🏾' : '👨🏾'}</span>
          <span className="font-extrabold text-[11px] sm:text-xs tracking-tight text-amber-300">{guide.name}</span>
          <span className="text-[10px] text-slate-300 hidden sm:inline">• {guide.role.split('&')[0]}</span>
        </div>
      </div>
    </div>
  );
};
