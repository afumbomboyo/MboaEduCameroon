import React, { useEffect, useState, useRef } from 'react';
import { LocationMission, PupilProfile } from '../types';
import { playFootstepSound, playTaDaSound } from '../utils/audio';
import { subscribeToSpeechState, speakAvatarText } from '../utils/speech';

export type EmoteType = 'wave' | 'bounce' | 'compass' | 'groove' | 'thinking' | 'stretch';

interface EmoteConfig {
  type: EmoteType;
  label: string;
  badge: string;
  speech: string;
}

const EMOTE_CONFIGS: Record<EmoteType, EmoteConfig> = {
  wave: {
    type: 'wave',
    label: '👋 Ready to explore?',
    badge: '👋',
    speech: "Hello explorer! Where are we heading next?",
  },
  bounce: {
    type: 'bounce',
    label: '⭐ 10 Regions to win!',
    badge: '⭐',
    speech: "Ten Cameroon Regions to conquer!",
  },
  compass: {
    type: 'compass',
    label: '🧭 Scanning Cameroon...',
    badge: '🧭',
    speech: "Scanning the regional routes on the map!",
  },
  groove: {
    type: 'groove',
    label: '🎵 Loving the rhythm!',
    badge: '🎵',
    speech: "Enjoying the Cameroon music beat!",
  },
  thinking: {
    type: 'thinking',
    label: '💡 Where to next?',
    badge: '💡',
    speech: "Thinking about our next journey!",
  },
  stretch: {
    type: 'stretch',
    label: '🎒 Ready for action!',
    badge: '🎒',
    speech: "Scholar backpack packed and ready to march!",
  },
};

const EMOTE_KEYS: EmoteType[] = ['wave', 'bounce', 'compass', 'groove', 'thinking', 'stretch'];

interface MapAvatarProps {
  profile: PupilProfile;
  currentPos: { x: number; y: number };
  targetPos: { x: number; y: number } | null;
  targetMission: LocationMission | null;
  onArrival: (mission: LocationMission) => void;
}

export const MapAvatar: React.FC<MapAvatarProps> = ({
  profile,
  currentPos,
  targetPos,
  targetMission,
  onArrival,
}) => {
  const [pos, setPos] = useState<{ x: number; y: number }>(currentPos);
  const [isMoving, setIsMoving] = useState(false);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [runFrame, setRunFrame] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [talkFrame, setTalkFrame] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  // Direct DOM ref to SVG avatar group for instant, jitter-free 60fps movement
  const avatarGroupRef = useRef<SVGGElement | null>(null);

  // Idle Emote State
  const [currentEmote, setCurrentEmote] = useState<EmoteType | null>(null);
  const [emoteFrame, setEmoteFrame] = useState(0);
  const idleSecondsRef = useRef(0);
  const emoteIdxRef = useRef(0);

  const posRef = useRef(pos);
  posRef.current = pos;

  const onArrivalRef = useRef(onArrival);
  onArrivalRef.current = onArrival;

  // Keep position synchronized when no movement is active
  useEffect(() => {
    if (!targetPos) {
      setPos(currentPos);
      posRef.current = currentPos;
      if (avatarGroupRef.current) {
        avatarGroupRef.current.setAttribute(
          'transform',
          `translate(${currentPos.x}, ${currentPos.y})`
        );
      }
    }
  }, [currentPos, targetPos]);

  // Listen to speech state for talk synchronization
  useEffect(() => {
    const unsubscribe = subscribeToSpeechState((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsubscribe;
  }, []);

  // Talking mouth animation loop
  useEffect(() => {
    if (!isSpeaking) {
      setTalkFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setTalkFrame((prev) => (prev + 1) % 4);
    }, 130);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Periodic natural eye blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3400);
    return () => clearInterval(blinkInterval);
  }, []);

  // Cancel emote when moving, speaking, or targeting a mission
  useEffect(() => {
    if (isMoving || isSpeaking || targetPos) {
      setCurrentEmote(null);
      idleSecondsRef.current = 0;
    }
  }, [isMoving, isSpeaking, targetPos]);

  // Idle Timer: detects when avatar is left standing on the map without doing anything
  useEffect(() => {
    const timer = setInterval(() => {
      if (isMoving || isSpeaking || targetPos) {
        idleSecondsRef.current = 0;
        return;
      }

      idleSecondsRef.current += 1;

      // After 7 seconds standing idle on the map, trigger an emote!
      if (idleSecondsRef.current >= 7 && !currentEmote) {
        const nextType = EMOTE_KEYS[emoteIdxRef.current % EMOTE_KEYS.length];
        emoteIdxRef.current += 1;
        setCurrentEmote(nextType);
        setEmoteFrame(0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isMoving, isSpeaking, targetPos, currentEmote]);

  // Emote frame progression loop while emote is active
  useEffect(() => {
    if (!currentEmote) return;

    const animInterval = setInterval(() => {
      setEmoteFrame((prev) => {
        if (prev >= 32) {
          // Finished emote cycle (~3.8s)
          setCurrentEmote(null);
          idleSecondsRef.current = 0;
          return 0;
        }
        return prev + 1;
      });
    }, 120);

    return () => clearInterval(animInterval);
  }, [currentEmote]);

  // Interactive Avatar Click Handler
  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextType = EMOTE_KEYS[emoteIdxRef.current % EMOTE_KEYS.length];
    emoteIdxRef.current += 1;
    setCurrentEmote(nextType);
    setEmoteFrame(0);
    idleSecondsRef.current = 0;

    speakAvatarText(EMOTE_CONFIGS[nextType].speech, {
      rate: 0.86,
      pitch: 1.08,
    });
  };

  useEffect(() => {
    if (!targetPos) return;

    // Check if we are already at the target
    const dx = targetPos.x - posRef.current.x;
    const dy = targetPos.y - posRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 4) {
      if (targetMission) {
        onArrivalRef.current(targetMission);
      }
      return;
    }

    setIsMoving(true);
    setFacing(targetPos.x < posRef.current.x ? 'left' : 'right');

    const startX = posRef.current.x;
    const startY = posRef.current.y;
    const startTime = performance.now();
    // Smooth visible travel time so pupil clearly watches avatar journeying across Cameroon
    const duration = Math.min(2200, Math.max(1000, dist * 2.4));

    let animId: number;
    let stepCount = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Smooth easeInOutQuad curve
      const ease =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const newX = startX + (targetPos.x - startX) * ease;
      const newY = startY + (targetPos.y - startY) * ease;

      posRef.current = { x: newX, y: newY };

      // Directly update DOM transform attribute for instantaneous, smooth 60fps translation
      if (avatarGroupRef.current) {
        avatarGroupRef.current.setAttribute(
          'transform',
          `translate(${newX}, ${newY})`
        );
      }

      setPos({ x: newX, y: newY });
      setRunFrame((prev) => (prev + 1) % 8);

      // Play footstep sound periodically
      stepCount++;
      if (stepCount % 12 === 0) {
        playFootstepSound();
      }

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setIsMoving(false);
        setPos(targetPos);
        posRef.current = targetPos;
        if (avatarGroupRef.current) {
          avatarGroupRef.current.setAttribute(
            'transform',
            `translate(${targetPos.x}, ${targetPos.y})`
          );
        }
        playTaDaSound();
        if (targetMission) {
          onArrivalRef.current(targetMission);
        }
      }
    };

    animId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animId);
  }, [targetPos?.x, targetPos?.y, targetMission?.id]);

  // Determine outfit visual flair
  const outfit = profile.avatarOutfit || 'khaki_uniform';
  let outfitColor = '#d97706'; // khaki gold
  let accessory = '🎒';

  if (outfit === 'toghu') {
    outfitColor = '#1e1b4b'; // royal dark indigo
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

  // Animation calculation for running legs, bob, and emotes
  const isOddFrame = runFrame % 2 === 0;
  const idleBob = Math.sin(Date.now() / 350) * 1.5;
  const talkBob = isSpeaking ? (talkFrame % 2 === 0 ? -1.5 : 0.8) : 0;

  // Emote-specific calculations
  let emoteBob = 0;
  let emoteArm1 = 0;
  let emoteArm2 = 0;
  let emoteLeg1 = 0;
  let emoteLeg2 = 0;
  let emoteHeadTilt = 0;
  let emoteSwayX = 0;

  if (currentEmote === 'wave') {
    emoteArm2 = -85 + Math.sin(emoteFrame * 0.9) * 26; // arm waving back and forth
    emoteArm1 = 12;
    emoteHeadTilt = Math.sin(emoteFrame * 0.4) * 4;
  } else if (currentEmote === 'bounce') {
    emoteBob = -Math.abs(Math.sin(emoteFrame * 0.7)) * 12; // big energetic bounce!
    emoteArm1 = -75;
    emoteArm2 = -75; // double victory salute
    emoteLeg1 = Math.abs(emoteBob) > 4 ? 20 : 0;
    emoteLeg2 = Math.abs(emoteBob) > 4 ? -20 : 0;
  } else if (currentEmote === 'compass') {
    emoteArm2 = -48; // holding up compass
    emoteArm1 = 8;
    emoteHeadTilt = Math.sin(emoteFrame * 0.3) * 6; // looking around
  } else if (currentEmote === 'groove') {
    emoteSwayX = Math.sin(emoteFrame * 0.8) * 3;
    emoteArm1 = Math.sin(emoteFrame * 0.8) * 32;
    emoteArm2 = -Math.sin(emoteFrame * 0.8) * 32;
    emoteBob = Math.sin(emoteFrame * 1.6) * 1.8;
  } else if (currentEmote === 'thinking') {
    emoteArm2 = -58; // hand on chin
    emoteArm1 = 10;
    emoteHeadTilt = -6; // tilted head
  } else if (currentEmote === 'stretch') {
    emoteArm1 = -88;
    emoteArm2 = -88; // both arms stretching straight up
    emoteBob = -2;
  }

  const bobY = isMoving
    ? Math.sin(runFrame * 0.8) * 3
    : currentEmote
    ? emoteBob
    : idleBob + talkBob;

  const legAngle1 = isMoving ? (isOddFrame ? 25 : -25) : currentEmote ? emoteLeg1 : 0;
  const legAngle2 = isMoving ? (isOddFrame ? -25 : 25) : currentEmote ? emoteLeg2 : 0;

  const armAngle1 = isMoving
    ? isOddFrame
      ? -20
      : 20
    : currentEmote
    ? emoteArm1
    : isSpeaking
    ? -26 + (talkFrame % 2) * 14
    : 0;

  const armAngle2 = isMoving
    ? isOddFrame
      ? 20
      : -20
    : currentEmote
    ? emoteArm2
    : isSpeaking
    ? 16
    : 0;

  return (
    <g
      ref={avatarGroupRef}
      id="player-map-avatar"
      transform={`translate(${pos.x + emoteSwayX}, ${pos.y})`}
      className="select-none z-30 cursor-pointer pointer-events-auto"
      onClick={handleAvatarClick}
    >
      {/* Scaled Avatar Container for high visibility across Cameroon map */}
      <g transform="scale(2.5)">
        {/* Active Journey Runner Pill Banner */}
        {isMoving && targetMission && (
          <g transform="translate(0, -48)">
            <rect
              x="-36"
              y="-10"
              width="72"
              height="16"
              rx="8"
              fill="#065f46"
              stroke="#34d399"
              strokeWidth="1.5"
              filter="drop-shadow(0 3px 5px rgba(0,0,0,0.3))"
            />
            <polygon
              points="-3,6 3,6 0,10"
              fill="#065f46"
              stroke="#34d399"
              strokeWidth="1"
            />
            <line x1="-2.5" y1="6" x2="2.5" y2="6" stroke="#065f46" strokeWidth="1.8" />
            <text
              x="0"
              y="1.5"
              fontSize="6.5"
              fontWeight="900"
              fill="#ecfdf5"
              textAnchor="middle"
            >
              🏃 To {targetMission.city}!
            </text>
          </g>
        )}
        {/* 1. Ground Shadow (scales with bob) */}
        <ellipse
          cx="0"
          cy="4"
          rx={isMoving ? 15 : 13}
          ry={isMoving ? 5.5 : Math.max(2, 5 - Math.abs(bobY) * 0.3)}
          fill="#0f172a"
          opacity={Math.max(0.18, 0.38 - Math.abs(bobY) * 0.02)}
        />

        {/* 2. Dust Puffs behind avatar while running */}
        {isMoving && (
          <g transform={`translate(${facing === 'right' ? -18 : 18}, 2)`}>
            <circle
              cx="0"
              cy="0"
              r={isOddFrame ? 4.5 : 3}
              fill="#e2e8f0"
              opacity="0.75"
            />
            <circle
              cx={facing === 'right' ? -7 : 7}
              cy="-2"
              r={isOddFrame ? 2.5 : 4}
              fill="#cbd5e1"
              opacity="0.55"
            />
          </g>
        )}

        {/* Floating Idle Emote VFX & Floating Speech Bubble */}
        {currentEmote && (
          <g transform="translate(0, -48)">
            {/* Bubble Pill with Emerald Outline */}
            <rect
              x="-36"
              y="-10"
              width="72"
              height="16"
              rx="8"
              fill="#ffffff"
              stroke="#059669"
              strokeWidth="1.5"
              filter="drop-shadow(0 3px 5px rgba(0,0,0,0.25))"
            />
            {/* Pointer arrow to avatar head */}
            <polygon
              points="-3,6 3,6 0,10"
              fill="#ffffff"
              stroke="#059669"
              strokeWidth="1"
            />
            <line x1="-2.5" y1="6" x2="2.5" y2="6" stroke="#ffffff" strokeWidth="1.8" />
            <text
              x="0"
              y="1.5"
              fontSize="6.5"
              fontWeight="900"
              fill="#065f46"
              textAnchor="middle"
            >
              {EMOTE_CONFIGS[currentEmote].label}
            </text>
          </g>
        )}

        {/* Specific Emote Particle Visuals */}
        {currentEmote === 'wave' && (
          <g transform="translate(10, -26)">
            <text
              x="0"
              y="0"
              fontSize="8"
              opacity={0.8 + Math.sin(emoteFrame * 0.8) * 0.2}
            >
              ✨
            </text>
          </g>
        )}
        {currentEmote === 'bounce' && (
          <g transform="translate(-14, -28)">
            <text x="0" y="0" fontSize="7">⭐</text>
            <text x="24" y="-3" fontSize="7">⭐</text>
          </g>
        )}
        {currentEmote === 'groove' && (
          <g transform="translate(-10, -28)">
            <text
              x={Math.sin(emoteFrame * 0.5) * 4}
              y={-((emoteFrame * 1.5) % 16)}
              fontSize="7"
              fill="#ec4899"
            >
              🎵
            </text>
            <text
              x={18 + Math.cos(emoteFrame * 0.5) * 4}
              y={-((emoteFrame * 1.5 + 8) % 16)}
              fontSize="7"
              fill="#8b5cf6"
            >
              🎶
            </text>
          </g>
        )}
        {currentEmote === 'thinking' && (
          <g transform="translate(8, -26)">
            <circle cx="0" cy="0" r="3.5" fill="#fef08a" opacity="0.9" />
            <text x="-2" y="2.5" fontSize="6">💡</text>
          </g>
        )}

        {/* Animated Speech Sound Ripples floating up when avatar is talking */}
        {isSpeaking && (
          <g transform="translate(6, -24)" className="animate-pulse">
            <path
              d="M 2,0 A 4,4 0 0,1 2,8"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M 5,-2 A 7,7 0 0,1 5,10"
              fill="none"
              stroke="#059669"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity={talkFrame % 2 === 0 ? 0.9 : 0.4}
            />
            <path
              d="M 8,-4 A 10,10 0 0,1 8,12"
              fill="none"
              stroke="#047857"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity={talkFrame >= 2 ? 0.9 : 0.3}
            />
          </g>
        )}

        {/* 3. Avatar Body with directional flip and bobbing */}
        <g
          transform={`translate(0, ${bobY - 14}) scale(${facing === 'left' ? -1 : 1}, 1)`}
        >
          {/* Legs */}
          <g stroke="#334155" strokeWidth="3" strokeLinecap="round">
            {/* Left leg */}
            <line
              x1="-3"
              y1="8"
              x2="-3"
              y2="18"
              transform={`rotate(${legAngle1}, -3, 8)`}
            />
            {/* Right leg */}
            <line
              x1="3"
              y1="8"
              x2="3"
              y2="18"
              transform={`rotate(${legAngle2}, 3, 8)`}
            />
          </g>

          {/* Shoes */}
          <ellipse cx="-3" cy="18" rx="3.5" ry="2" fill="#0f172a" />
          <ellipse cx="3" cy="18" rx="3.5" ry="2" fill="#0f172a" />

          {/* Torso & Uniform Outfit */}
          <rect
            x="-7"
            y="-2"
            width="14"
            height="12"
            rx="3"
            fill={outfitColor}
            stroke="#ffffff"
            strokeWidth="1"
          />

          {/* Toghu embroidery or Uniform Collar Accent */}
          <line x1="0" y1="-2" x2="0" y2="10" stroke="#f59e0b" strokeWidth="1.2" />
          <circle cx="0" cy="2" r="1" fill="#facc15" />
          <circle cx="0" cy="6" r="1" fill="#facc15" />

          {/* Arms (animated when speaking, running, or emoting) */}
          <g stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
            {/* Left arm */}
            <line
              x1="-7"
              y1="0"
              x2="-10"
              y2="7"
              transform={`rotate(${armAngle1}, -7, 0)`}
            />
            {/* Right arm */}
            <line
              x1="7"
              y1="0"
              x2="10"
              y2="7"
              transform={`rotate(${armAngle2}, 7, 0)`}
            />
          </g>

          {/* Emote Props in Hand */}
          {currentEmote === 'compass' && (
            <g transform="translate(10, 0)">
              <circle cx="0" cy="0" r="3.5" fill="#facc15" stroke="#78350f" strokeWidth="0.8" />
              <line
                x1="0"
                y1="0"
                x2={Math.sin(emoteFrame * 0.4) * 2.2}
                y2={-Math.cos(emoteFrame * 0.4) * 2.2}
                stroke="#dc2626"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Head with subtle talking or emote tilt */}
          <g
            transform={`rotate(${
              currentEmote
                ? emoteHeadTilt
                : isSpeaking
                ? talkFrame % 2 === 0
                  ? 3
                  : -2
                : 0
            }, 0, -9)`}
          >
            <circle
              cx="0"
              cy="-9"
              r="6.5"
              fill="#854d0e" // warm bronze skin tone
              stroke="#ffffff"
              strokeWidth="0.8"
            />

            {/* Cheerful Eyes (blinking support & wink during wave) */}
            {isBlinking ? (
              <g stroke="#0f172a" strokeWidth="0.9" strokeLinecap="round">
                <line x1="1" y1="-9.5" x2="3" y2="-9.5" />
                <line x1="4" y1="-9.5" x2="6" y2="-9.5" />
              </g>
            ) : currentEmote === 'wave' && Math.floor(emoteFrame / 4) % 2 === 0 ? (
              // Friendly wink
              <g>
                <circle cx="2" cy="-9.5" r="0.9" fill="#0f172a" />
                <circle cx="2.3" cy="-9.8" r="0.3" fill="#ffffff" />
                <path d="M 4,-9.5 Q 5.5,-10.5 7,-9.5" stroke="#0f172a" strokeWidth="0.9" fill="none" />
              </g>
            ) : (
              <g>
                <circle cx="2" cy="-9.5" r="0.9" fill="#0f172a" />
                <circle cx="5" cy="-9.5" r="0.9" fill="#0f172a" />
                {/* Catchlight */}
                <circle cx="2.3" cy="-9.8" r="0.3" fill="#ffffff" />
                <circle cx="5.3" cy="-9.8" r="0.3" fill="#ffffff" />
              </g>
            )}

            {/* Animated Talking / Emote Mouth */}
            {isSpeaking ? (
              talkFrame === 0 ? (
                // Open speaking oval
                <ellipse cx="3.5" cy="-6.5" rx="1.8" ry="1.4" fill="#450a0a">
                  <path d="M 2.2,-6.8 Q 3.5,-7.2 4.8,-6.8" stroke="#ffffff" strokeWidth="0.6" fill="none" />
                </ellipse>
              ) : talkFrame === 1 ? (
                // Wide smile phoneme
                <path
                  d="M 1.5,-7 Q 3.5,-4.8 5.5,-7 Z"
                  fill="#991b1b"
                  stroke="#450a0a"
                  strokeWidth="0.5"
                />
              ) : talkFrame === 2 ? (
                // Round 'O' vowel
                <circle cx="3.5" cy="-6.5" r="1.3" fill="#450a0a">
                  <circle cx="3.5" cy="-6.1" r="0.5" fill="#f87171" />
                </circle>
              ) : (
                // Cheerful closed smile
                <path
                  d="M 1.5,-7.5 Q 3.5,-5.5 5.5,-7.5"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
              )
            ) : currentEmote === 'bounce' || currentEmote === 'wave' ? (
              // Big happy open smile
              <path
                d="M 1.2,-7.5 Q 3.5,-4.2 5.8,-7.5 Z"
                fill="#ef4444"
                stroke="#0f172a"
                strokeWidth="0.6"
              />
            ) : (
              // Default Happy Smile
              <path
                d="M 1.5,-7.5 Q 3.5,-5.5 5.5,-7.5"
                fill="none"
                stroke="#0f172a"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            )}

            {/* Hair / Student Cap */}
            <path
              d="M -5.5,-12 Q 0,-16 5.5,-12 Q 5.5,-9 -5.5,-9 Z"
              fill="#1e293b"
            />
          </g>

          {/* Backpack */}
          <rect
            x="-9.5"
            y="0"
            width="4"
            height="8"
            rx="1.5"
            fill="#dc2626"
            stroke="#ffffff"
            strokeWidth="0.6"
          />
        </g>

        {/* 4. Floating Name Tag & Pupil Level (always upright, not flipped) */}
        <g transform="translate(0, -32)">
          <rect
            x="-26"
            y="-8"
            width="52"
            height="14"
            rx="7"
            fill={isSpeaking ? '#047857' : '#064e3b'}
            stroke={isSpeaking ? '#6ee7b7' : '#34d399'}
            strokeWidth={isSpeaking ? '1.8' : '1.2'}
            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))"
          />
          <text
            x="0"
            y="2.5"
            fontSize="7.5"
            fontWeight="900"
            fill="#ffffff"
            textAnchor="middle"
          >
            {accessory} {profile.name.split(' ')[0]}
          </text>

          {/* Level Badge Circle */}
          <g transform="translate(24, -1)">
            <circle r="5" fill="#facc15" stroke="#78350f" strokeWidth="0.8" />
            <text
              x="0"
              y="2.5"
              fontSize="5.5"
              fontWeight="900"
              fill="#78350f"
              textAnchor="middle"
            >
              {profile.level}
            </text>
          </g>
        </g>
      </g>
    </g>
  );
};
