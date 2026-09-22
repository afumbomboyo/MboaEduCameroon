import React, { useEffect, useState } from 'react';
import { PupilProfile } from '../types';
import { subscribeToSpeechState, stopSpeech, speakAvatarText } from '../utils/speech';
import { Volume2, VolumeX } from 'lucide-react';

interface TalkingPupilCardProps {
  profile: PupilProfile;
  speechTextToRead?: string;
  className?: string;
}

export const TalkingPupilCard: React.FC<TalkingPupilCardProps> = ({
  profile,
  speechTextToRead,
  className = '',
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [talkFrame, setTalkFrame] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const unsub = subscribeToSpeechState((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsub;
  }, []);

  // Animate mouth when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setTalkFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setTalkFrame((prev) => (prev + 1) % 4);
    }, 125);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Periodic blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3200);
    return () => clearInterval(blinkInterval);
  }, []);

  // Determine outfit styling
  const outfit = profile.avatarOutfit || 'khaki_uniform';
  let outfitColor = '#d97706'; // khaki
  let accessory = '🎒';

  if (outfit === 'toghu') {
    outfitColor = '#1e1b4b'; // royal indigo
    accessory = '👑';
  } else if (outfit === 'kaba') {
    outfitColor = '#0284c7'; // ocean blue
    accessory = '🌊';
  } else if (outfit === 'gandoura') {
    outfitColor = '#facc15'; // bright sahel yellow
    accessory = '☀️';
  } else if (outfit === 'navy_uniform') {
    outfitColor = '#1e3a8a'; // navy
    accessory = '📘';
  }

  const handleReplaySpeech = () => {
    if (isSpeaking) {
      stopSpeech();
    } else if (speechTextToRead) {
      speakAvatarText(speechTextToRead, {
        rate: 0.95,
        pitch: 1.1,
      });
    }
  };

  return (
    <div
      id="talking-pupil-character"
      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-emerald-50/90 via-white/80 to-teal-50/90 border border-emerald-200/80 shadow-md ${className}`}
    >
      {/* Speaking Indicator Badge with animated equalizer bars */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] shadow-sm whitespace-nowrap">
        {isSpeaking ? (
          <>
            <span className="flex items-center gap-0.5 h-2.5">
              <span className="w-0.5 h-2 bg-emerald-200 rounded-full animate-pulse" />
              <span className="w-0.5 h-3 bg-white rounded-full animate-bounce" />
              <span className="w-0.5 h-1.5 bg-emerald-200 rounded-full animate-pulse" />
            </span>
            <span>Speaking...</span>
          </>
        ) : (
          <span>{accessory} {profile.name.split(' ')[0]}</span>
        )}
      </div>

      {/* High-Definition Animated Vector Avatar */}
      <div className="relative w-24 h-28 sm:w-28 sm:h-32 flex items-center justify-center select-none pointer-events-none">
        <svg
          viewBox="-40 -50 80 100"
          className="w-full h-full overflow-visible"
        >
          {/* Ground soft shadow */}
          <ellipse
            cx="0"
            cy="42"
            rx="24"
            ry="7"
            fill="#0f172a"
            opacity="0.25"
          />

          {/* Sound waves emitted while speaking */}
          {isSpeaking && (
            <g transform="translate(18, -25)" className="animate-pulse">
              <path
                d="M 2,0 A 6,6 0 0,1 2,14"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 7,-3 A 10,10 0 0,1 7,17"
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                strokeLinecap="round"
                opacity={talkFrame % 2 === 0 ? 0.9 : 0.3}
              />
              <path
                d="M 12,-6 A 14,14 0 0,1 12,20"
                fill="none"
                stroke="#047857"
                strokeWidth="2"
                strokeLinecap="round"
                opacity={talkFrame >= 2 ? 0.9 : 0.2}
              />
            </g>
          )}

          {/* Avatar Body with gentle talking gesture */}
          <g
            transform={`translate(0, ${
              isSpeaking ? (talkFrame % 2 === 0 ? -2 : 1) : 0
            })`}
          >
            {/* Legs */}
            <line x1="-8" y1="20" x2="-8" y2="40" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
            <line x1="8" y1="20" x2="8" y2="40" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />

            {/* School Shoes */}
            <ellipse cx="-8" cy="40" rx="6" ry="3.5" fill="#991b1b" />
            <ellipse cx="8" cy="40" rx="6" ry="3.5" fill="#991b1b" />

            {/* Torso & Cultural Uniform */}
            <rect
              x="-16"
              y="-4"
              width="32"
              height="28"
              rx="7"
              fill={outfitColor}
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* Embroidery / Collar details */}
            <line x1="0" y1="-4" x2="0" y2="24" stroke="#f59e0b" strokeWidth="2.5" />
            <circle cx="0" cy="5" r="2" fill="#facc15" />
            <circle cx="0" cy="14" r="2" fill="#facc15" />

            {/* Left Arm (Relaxed) */}
            <line
              x1="-16"
              y1="0"
              x2="-24"
              y2="16"
              stroke="#f59e0b"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Right Arm (Waving or Gesturing when talking!) */}
            <line
              x1="16"
              y1="0"
              x2={isSpeaking ? (talkFrame % 2 === 0 ? 26 : 22) : 24}
              y2={isSpeaking ? (talkFrame % 2 === 0 ? -12 : -6) : 16}
              stroke="#f59e0b"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Hand */}
            <circle
              cx={isSpeaking ? (talkFrame % 2 === 0 ? 26 : 22) : 24}
              cy={isSpeaking ? (talkFrame % 2 === 0 ? -12 : -6) : 16}
              r="3.5"
              fill="#854d0e"
            />

            {/* Head with talking tilt */}
            <g
              transform={`rotate(${
                isSpeaking ? (talkFrame % 2 === 0 ? 4 : -3) : 0
              }, 0, -20)`}
            >
              <circle
                cx="0"
                cy="-20"
                r="15"
                fill="#854d0e"
                stroke="#ffffff"
                strokeWidth="1.8"
              />

              {/* Eyes with blinking */}
              {isBlinking ? (
                <g stroke="#0f172a" strokeWidth="2" strokeLinecap="round">
                  <line x1="-8" y1="-22" x2="-3" y2="-22" />
                  <line x1="3" y1="-22" x2="8" y2="-22" />
                </g>
              ) : (
                <g>
                  {/* Left Eye */}
                  <circle cx="-5.5" cy="-22" r="2.4" fill="#0f172a" />
                  <circle cx="-4.5" cy="-23" r="0.8" fill="#ffffff" />
                  {/* Right Eye */}
                  <circle cx="5.5" cy="-22" r="2.4" fill="#0f172a" />
                  <circle cx="6.5" cy="-23" r="0.8" fill="#ffffff" />
                </g>
              )}

              {/* Cheerful Eyebrows */}
              <path d="M -8,-27 Q -5,-29 -2,-27" stroke="#1e293b" strokeWidth="1.4" fill="none" strokeLinecap="round" />
              <path d="M 2,-27 Q 5,-29 8,-27" stroke="#1e293b" strokeWidth="1.4" fill="none" strokeLinecap="round" />

              {/* Animated Talking Mouth */}
              {isSpeaking ? (
                talkFrame === 0 ? (
                  // Open talking oval with little tongue/teeth
                  <g>
                    <ellipse cx="0" cy="-13" rx="4.5" ry="3.5" fill="#450a0a" />
                    <path d="M -3,-14 Q 0,-15 3,-14" stroke="#ffffff" strokeWidth="1.2" fill="none" />
                    <ellipse cx="0" cy="-11.8" rx="2.5" ry="1.2" fill="#ef4444" />
                  </g>
                ) : talkFrame === 1 ? (
                  // Wide articulate smile
                  <g>
                    <path
                      d="M -5,-15 Q 0,-9 5,-15 Z"
                      fill="#991b1b"
                      stroke="#450a0a"
                      strokeWidth="1"
                    />
                    <path d="M -4,-15 Q 0,-14 4,-15" stroke="#ffffff" strokeWidth="1" fill="none" />
                  </g>
                ) : talkFrame === 2 ? (
                  // Round 'O' vowel
                  <g>
                    <circle cx="0" cy="-13" r="3.2" fill="#450a0a" />
                    <circle cx="0" cy="-12" r="1.5" fill="#f87171" />
                  </g>
                ) : (
                  // Smiling warm mouth
                  <path
                    d="M -5,-15 Q 0,-10 5,-15"
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                )
              ) : (
                // Happy default smile
                <path
                  d="M -5,-15 Q 0,-10 5,-15"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}

              {/* Scholar Cap / Hair */}
              <path
                d="M -13,-27 Q 0,-37 13,-27 Q 13,-20 -13,-20 Z"
                fill="#1e293b"
              />
            </g>

            {/* School Backpack on back */}
            <rect
              x="-22"
              y="0"
              width="8"
              height="18"
              rx="3"
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
          </g>
        </svg>
      </div>

      {/* Read Again / Voice Control Button */}
      {speechTextToRead && (
        <button
          onClick={handleReplaySpeech}
          title={isSpeaking ? 'Mute avatar voice' : 'Listen to avatar again'}
          className={`mt-1 flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isSpeaking
              ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-700 animate-pulse" />
              <span>Stop Voice</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Read Aloud</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
