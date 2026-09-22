import React, { useState, useEffect } from 'react';
import { subscribeToSpeechState, speakAvatarText } from '../utils/speech';
import { RegionalGuide } from '../data/cameroonRegionalSites';
import { playClickSound } from '../utils/audio';

interface RegionalGuideAvatarProps {
  guide: RegionalGuide;
  currentSpeech?: string;
  isSpeaking: boolean;
  onReplaySpeech?: () => void;
  position?: { x: number; y: number }; // percentage inside map if absolute
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

  // Synchronize speech state with global speech synthesizer
  useEffect(() => {
    const unsub = subscribeToSpeechState((speaking) => {
      setInternalIsSpeaking(speaking);
    });
    return unsub;
  }, []);

  // Animate mouth when talking
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

  // Gentle idle breathing / idle bob
  useEffect(() => {
    const interval = setInterval(() => {
      setBounceFrame((prev) => (prev + 1) % 12);
    }, 280);
    return () => clearInterval(interval);
  }, []);

  // Natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  const bounceOffsetY = Math.sin((bounceFrame / 12) * Math.PI * 2) * 3;

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
      {/* Dynamic Speech Dialogue Bubble */}
      {currentSpeech && (
        <div
          id="regional-guide-speech-bubble"
          className="absolute -top-3 sm:-top-6 left-1/2 -translate-x-1/2 -translate-y-full w-64 sm:w-80 bg-white/95 backdrop-blur-md text-slate-900 rounded-2xl p-3.5 shadow-2xl border-2 border-emerald-500/30 text-xs sm:text-sm font-medium z-30 transition-all duration-300 animate-in fade-in zoom-in-95"
        >
          {/* Header indicator with speaker wave */}
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold tracking-wide uppercase text-emerald-800">
                {guide.name} ({guide.gender === 'female' ? 'Guide • Elle' : 'Guide • Il'})
              </span>
            </div>

            {/* Audio Replay & Speaking Indicator */}
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

          {/* Speech Text Content */}
          <p className="text-slate-800 leading-snug font-medium text-xs sm:text-[13px]">
            {currentSpeech}
          </p>

          {/* Speech Bubble Arrow Indicator */}
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white/95 drop-shadow" />
        </div>
      )}

      {/* Guide Visual Avatar Card */}
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
        {/* Glow Ring Behind Avatar */}
        <div className="absolute inset-0 -m-2 rounded-full bg-emerald-400/20 blur-md group-hover:bg-emerald-400/35 transition-all" />

        {/* SVG Avatar Character Rendering */}
        <div className={`relative ${sizeClasses} drop-shadow-xl transition-transform group-hover:scale-105 duration-200`}>
          <svg
            viewBox="0 0 120 140"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Skin Tone Gradient */}
              <linearGradient id="guideSkin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#784421" />
                <stop offset="100%" stopColor="#542e14" />
              </linearGradient>

              {/* Gold Embroidery Gradient */}
              <linearGradient id="guideGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>

              {/* Female Headwrap / Gown Gradient */}
              <linearGradient id="femaleAttire" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>

              {/* Male Tunic / Vest Gradient */}
              <linearGradient id="maleAttire" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f766e" />
                <stop offset="100%" stopColor="#115e59" />
              </linearGradient>

              {/* African Print Accent */}
              <linearGradient id="africanPrint" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>

            {/* Shadow beneath character */}
            <ellipse cx="60" cy="134" rx="34" ry="6" fill="#000000" fillOpacity="0.25" />

            {/* BODY & ATTIRE */}
            {isFemale ? (
              /* FEMALE AVATAR BODY (Graceful Kaba / Traditional Toghu Gown) */
              <g id="female-body">
                {/* Shoulders & Gown */}
                <path
                  d="M26 130 C26 92 40 82 60 82 C80 82 94 92 94 130 Z"
                  fill="url(#femaleAttire)"
                />
                {/* Decorative Floral / Geometric Center Panel */}
                <path
                  d="M50 82 L70 82 L76 130 L44 130 Z"
                  fill="url(#africanPrint)"
                  opacity="0.9"
                />
                {/* Gold Embroidery Trim */}
                <path
                  d="M48 82 L42 130 M72 82 L78 130"
                  stroke="url(#guideGold)"
                  strokeWidth="2.5"
                  strokeDasharray="3 2"
                />

                {/* Elegant Cowrie / Coral Bead Necklace */}
                <path
                  d="M44 78 Q60 92 76 78"
                  fill="none"
                  stroke="#fef08a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="60" cy="86" r="3.5" fill="#f43f5e" />
                <circle cx="52" cy="84" r="2.5" fill="#fef08a" />
                <circle cx="68" cy="84" r="2.5" fill="#fef08a" />

                {/* Graceful Neck */}
                <rect x="52" y="66" width="16" height="15" rx="4" fill="url(#guideSkin)" />
              </g>
            ) : (
              /* MALE AVATAR BODY (Explorer Vest / Traditional Royal Gandoura) */
              <g id="male-body">
                {/* Broad Shoulders & Tunic */}
                <path
                  d="M22 130 C22 88 38 78 60 78 C82 78 98 88 98 130 Z"
                  fill="url(#maleAttire)"
                />
                {/* Vest / Tunic Lapels */}
                <path
                  d="M48 78 L60 98 L72 78 Z"
                  fill="#f8fafc"
                />
                {/* Ranger Epaulets / Golden Shoulder Tabs */}
                <rect x="22" y="90" width="12" height="5" rx="2" fill="url(#guideGold)" />
                <rect x="86" y="90" width="12" height="5" rx="2" fill="url(#guideGold)" />

                {/* Cameroon Tricolor Lapel Pin */}
                <circle cx="60" cy="106" r="4.5" fill="#16a34a" />
                <circle cx="60" cy="106" r="3" fill="#dc2626" />
                <polygon points="60,103 61,105 63,105 61.5,106 62,108 60,107 58,108 58.5,106 57,105 59,105" fill="#fbbf24" />

                {/* Strong Neck */}
                <rect x="50" y="66" width="20" height="16" rx="4" fill="url(#guideSkin)" />
              </g>
            )}

            {/* HEAD & FACE */}
            <g id="head">
              {/* Head Base */}
              <ellipse cx="60" cy="50" rx="24" ry="27" fill="url(#guideSkin)" />

              {/* Ears */}
              <ellipse cx="36" cy="52" rx="4.5" ry="7" fill="url(#guideSkin)" />
              <ellipse cx="84" cy="52" rx="4.5" ry="7" fill="url(#guideSkin)" />

              {/* Earrings for Female */}
              {isFemale && (
                <>
                  <circle cx="36" cy="58" r="2.5" fill="url(#guideGold)" />
                  <circle cx="84" cy="58" r="2.5" fill="url(#guideGold)" />
                </>
              )}

              {/* HAIR & HEADWEAR */}
              {isFemale ? (
                /* FEMALE ELEGANT HEADWRAP (Foulard / Gelé / Royal Toghu Wrap) */
                <g id="female-headwear">
                  {/* High Royal Headwrap */}
                  <path
                    d="M34 46 C34 20 44 10 60 10 C76 10 86 20 86 46 C80 34 72 32 60 32 C48 32 40 34 34 46 Z"
                    fill="url(#femaleAttire)"
                  />
                  {/* Sculpted Crown Fold */}
                  <path
                    d="M38 24 Q60 8 82 24 Q60 18 38 24 Z"
                    fill="url(#guideGold)"
                  />
                  {/* Decorative Brooch on Headwrap */}
                  <circle cx="60" cy="22" r="4.5" fill="#f43f5e" stroke="url(#guideGold)" strokeWidth="1.5" />
                </g>
              ) : (
                /* MALE HEADWEAR / HAIR (Fako Ranger Cap / Traditional Chechia) */
                <g id="male-headwear">
                  {/* Short Neat Hair Baseline */}
                  <path
                    d="M36 44 C36 28 46 22 60 22 C74 22 84 28 84 44 C80 36 72 34 60 34 C48 34 40 36 36 44 Z"
                    fill="#18181b"
                  />
                  {/* Ranger Felt Cap / Chieftain Cap */}
                  <path
                    d="M32 36 C32 20 44 14 60 14 C76 14 88 20 88 36 L92 40 L28 40 Z"
                    fill="#1e293b"
                  />
                  {/* Cap Visor / Brim */}
                  <path
                    d="M26 38 C42 42 78 42 94 38 L90 44 C76 46 44 46 30 44 Z"
                    fill="#0f172a"
                  />
                  {/* Golden Badge on Cap */}
                  <polygon points="60,20 63,26 69,26 64,30 66,36 60,32 54,36 56,30 51,26 57,26" fill="url(#guideGold)" />
                </g>
              )}

              {/* EYEBROWS */}
              {isFemale ? (
                <>
                  <path d="M44 42 Q50 39 55 42" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  <path d="M65 42 Q70 39 76 42" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                </>
              ) : (
                <>
                  <path d="M42 42 Q49 39 56 41" stroke="#18181b" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M64 41 Q71 39 78 42" stroke="#18181b" strokeWidth="3" strokeLinecap="round" fill="none" />
                </>
              )}

              {/* EYES (With Blinking) */}
              {isBlinking ? (
                <>
                  <line x1="44" y1="48" x2="54" y2="48" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="66" y1="48" x2="76" y2="48" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  {/* Left Eye */}
                  <ellipse cx="49" cy="48" rx="4.5" ry="5.5" fill="#ffffff" />
                  <circle cx="49" cy="48" r="3.2" fill="#261b14" />
                  <circle cx="47.5" cy="46.5" r="1.2" fill="#ffffff" />
                  {isFemale && <path d="M43 45 L41 43 M55 45 L57 43" stroke="#18181b" strokeWidth="1.2" />}

                  {/* Right Eye */}
                  <ellipse cx="71" cy="48" rx="4.5" ry="5.5" fill="#ffffff" />
                  <circle cx="71" cy="48" r="3.2" fill="#261b14" />
                  <circle cx="69.5" cy="46.5" r="1.2" fill="#ffffff" />
                  {isFemale && <path d="M65 45 L63 43 M77 45 L79 43" stroke="#18181b" strokeWidth="1.2" />}
                </>
              )}

              {/* NOSE */}
              <path d="M57 52 Q60 56 63 52" stroke="#542e14" strokeWidth="1.8" fill="none" strokeLinecap="round" />

              {/* CHEEKS */}
              <ellipse cx="42" cy="56" rx="4" ry="2.5" fill="#f43f5e" opacity="0.25" />
              <ellipse cx="78" cy="56" rx="4" ry="2.5" fill="#f43f5e" opacity="0.25" />

              {/* MOUTH (Talking sync or warm smile) */}
              {isSpeaking ? (
                talkFrame % 2 === 0 ? (
                  // Open mouth when speaking
                  <g id="mouth-open">
                    <ellipse cx="60" cy="63" rx="5.5" ry="4.5" fill="#3f1d14" />
                    <ellipse cx="60" cy="62" rx="4" ry="1.8" fill="#ffffff" />
                    <ellipse cx="60" cy="64.5" rx="3.5" ry="2" fill="#e11d48" />
                  </g>
                ) : (
                  // Mid-speech mouth
                  <g id="mouth-mid">
                    <ellipse cx="60" cy="63" rx="4.5" ry="2.5" fill="#3f1d14" />
                    <line x1="56" y1="62.5" x2="64" y2="62.5" stroke="#ffffff" strokeWidth="1.2" />
                  </g>
                )
              ) : (
                // Warm, welcoming smile
                <path
                  d="M53 61 Q60 67 67 61"
                  stroke="#3f1d14"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </g>
          </svg>
        </div>

        {/* Guide Name Plate Badge */}
        <div className="mt-1 px-3 py-1 rounded-full bg-slate-900/90 text-white shadow-lg border border-slate-700 flex items-center gap-1.5 backdrop-blur-sm">
          <span className="text-xs">
            {isFemale ? '👩🏾' : '👨🏾'}
          </span>
          <span className="font-extrabold text-[11px] sm:text-xs tracking-tight text-amber-300">
            {guide.name}
          </span>
          <span className="text-[10px] text-slate-300 hidden sm:inline">
            • {guide.role.split('&')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};
