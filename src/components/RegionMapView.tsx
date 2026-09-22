'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  RegionDetail,
  PopularSite,
  CAMEROON_REGIONAL_DETAILS,
} from '../data/cameroonRegionalSites';
import {
  CAMEROON_REGIONAL_MAP_SPECS,
  RegionalMapSpec,
} from '../data/cameroonRegionalMaps';
import { LocationMission, PupilProfile } from '../types';
import { RegionalGuideAvatar } from './RegionalGuideAvatar';
import { speakAvatarText, stopSpeech } from '../utils/speech';
import {
  playClickSound,
  playHoverSound,
  playZoomInSound,
  playZoomOutSound,
} from '../utils/audio';
import { CAMEROON_MISSIONS } from '../data/cameroonLocations';
import {
  Compass,
  MapPin,
  Sparkles,
  BookOpen,
  ArrowLeft,
  Volume2,
  CheckCircle2,
  Trophy,
  Play,
  X,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RegionMapViewProps {
  regionId: string;
  profile: PupilProfile;
  onBackToCountry: () => void;
  onLaunchMission: (mission: LocationMission) => void;
}

/**
 * Computes greeting depending on the user's current time of day
 */
function getTimeOfDayGreeting(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'afternoon';
  } else {
    return 'evening';
  }
}

export const RegionMapView: React.FC<RegionMapViewProps> = ({
  regionId,
  profile,
  onBackToCountry,
  onLaunchMission,
}) => {
  const [, startTransition] = useTransition();

  // Find regional details or fallback to South West
  const regionData: RegionDetail =
    CAMEROON_REGIONAL_DETAILS[regionId] ||
    CAMEROON_REGIONAL_DETAILS['south_west'];

  // Find cartographic map specs matching country map structure
  const mapSpec: RegionalMapSpec =
    CAMEROON_REGIONAL_MAP_SPECS[regionId] ||
    CAMEROON_REGIONAL_MAP_SPECS['south_west'];

  const guide = regionData.guide;

  // Selected site for detailed view
  const [selectedSite, setSelectedSite] = useState<PopularSite | null>(null);
  const [hoveredSite, setHoveredSite] = useState<PopularSite | null>(null);

  // Position of the guide avatar on the map (in 900x650 coordinate space)
  const [guidePos, setGuidePos] = useState<{ x: number; y: number }>({
    x: 680,
    y: 490,
  });

  // Current speech bubble dialogue
  const [currentSpeech, setCurrentSpeech] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState<boolean>(true);

  // Zoom animation states ('entering' | 'ready' | 'leaving')
  const [zoomPhase, setZoomPhase] = useState<'entering' | 'ready' | 'leaving'>(
    'entering'
  );
  const [isLeaving, setIsLeaving] = useState<boolean>(false);

  // Greeting sentence as explicitly mandated by user:
  // "Good [greeting depending on the time of the day], my name is [Guide name] and I'll be your guide from now on. Where should we start exploring?"
  const initialGreeting = `Good ${getTimeOfDayGreeting()}, my name is ${guide.name} and I'll be your guide from now on. Where should we start exploring?`;

  // On mount: trigger zoom-in effect & audio, then deliver greeting
  useEffect(() => {
    // Play zoom in sound
    playZoomInSound();

    // Trigger enter transition
    const enterTimer = setTimeout(() => {
      setZoomPhase('ready');
    }, 450);

    // Deliver avatar greeting after visual map settles
    const speechTimer = setTimeout(() => {
      setCurrentSpeech(initialGreeting);
      setShowSpeechBubble(true);
      speakAvatarText(initialGreeting, {
        gender: guide.gender,
        onStart: () => {
          setIsSpeaking(true);
          setShowSpeechBubble(true);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setShowSpeechBubble(false);
        },
      });
    }, 600);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(speechTimer);
      stopSpeech();
    };
  }, [regionId, guide.name, guide.gender, initialGreeting]);

  // Handle clicking the Back Arrow to zoom out back to the whole country
  // MANDATE: "Don't just zoom out and zoom in when the avatar is still talking. Wait till they finish talking before you do so."
  // MANDATE: "when it's clicked, the avatar should say 'Bye, see you again next time'."
  const handleBackToCountry = () => {
    if (isLeaving) return; // Prevent duplicate clicks
    setIsLeaving(true);
    playClickSound();

    const farewellMessage = 'Bye, see you again next time';
    setCurrentSpeech(`${farewellMessage}! 👋`);
    setShowSpeechBubble(true);

    let hasExecutedZoomOut = false;
    const triggerZoomOut = () => {
      if (hasExecutedZoomOut) return;
      hasExecutedZoomOut = true;
      setIsSpeaking(false);

      // Play zoom-out sound effect AFTER speech completes
      playZoomOutSound();

      // Trigger zoom-out visual camera motion
      setZoomPhase('leaving');

      // Smoothly transition back to Cameroon country map
      setTimeout(() => {
        startTransition(() => {
          onBackToCountry();
        });
      }, 700);
    };

    // Guide avatar speaks the farewell sentence. We wait for onEnd before zooming out!
    speakAvatarText(farewellMessage, {
      gender: guide.gender,
      onStart: () => {
        setIsSpeaking(true);
        setShowSpeechBubble(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setShowSpeechBubble(false);
        triggerZoomOut();
      },
      onError: () => {
        setIsSpeaking(false);
        setShowSpeechBubble(false);
        triggerZoomOut();
      },
    });

    // Safety timeout in case speech synthesis takes unusually long or drops callback
    setTimeout(() => {
      triggerZoomOut();
    }, 2800);
  };

  // Replay current speech
  const handleReplaySpeech = () => {
    const textToSpeak = currentSpeech || initialGreeting;
    setShowSpeechBubble(true);
    speakAvatarText(textToSpeak, {
      gender: guide.gender,
      onStart: () => {
        setIsSpeaking(true);
        setShowSpeechBubble(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setShowSpeechBubble(false);
      },
    });
  };

  // Handle selecting a popular site pin
  const handleSelectSite = (site: PopularSite) => {
    playClickSound();
    setSelectedSite(site);

    // Map site to coordinates in mapSpec
    const pos = mapSpec.sitePositions[site.id] || {
      x: (site.coordinates.x / 100) * 900,
      y: (site.coordinates.y / 100) * 650,
    };

    // Guide moves towards the site to show accompaniment
    const targetX = Math.min(800, Math.max(120, pos.x + (pos.x > 450 ? -120 : 120)));
    const targetY = Math.min(580, Math.max(120, pos.y + (pos.y > 325 ? -70 : 70)));
    setGuidePos({ x: targetX, y: targetY });

    // Guide introduces the selected site
    const siteSpeech = `Mission alert: ${site.name}! ${site.tagline}. Ready to solve the challenge and help our community?`;
    setCurrentSpeech(siteSpeech);
    setShowSpeechBubble(true);

    speakAvatarText(siteSpeech, {
      gender: guide.gender,
      onStart: () => {
        setIsSpeaking(true);
        setShowSpeechBubble(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setShowSpeechBubble(false);
      },
    });
  };

  // Read full site facts aloud
  const handleReadSiteFactsAloud = (site: PopularSite) => {
    playClickSound();
    const factText = `${site.name}. ${site.description} Key facts: ${site.facts.join(' ')}`;
    setCurrentSpeech(`Exploring ${site.name}...`);
    setShowSpeechBubble(true);
    speakAvatarText(factText, {
      gender: guide.gender,
      onStart: () => {
        setIsSpeaking(true);
        setShowSpeechBubble(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setShowSpeechBubble(false);
      },
    });
  };

  // Find mission associated with this site or region
  const associatedMission =
    (selectedSite?.missionId &&
      CAMEROON_MISSIONS.find((m) => m.id === selectedSite.missionId)) ||
    CAMEROON_MISSIONS.find((m) => m.region === regionData.id);

  // Spread region missions across the regional map so they do not overlap and so
  // the map reads like a real geography-based challenge board instead of a single cluster.
  const regionMissionPins: PopularSite[] = (() => {
    const missionsInRegion = CAMEROON_MISSIONS.filter(
      (mission) => mission.region === regionId
    );

    const regionMissionPoints: Record<string, Array<{ x: number; y: number }>> = {
      south_west: [
        { x: 470, y: 260 }, { x: 550, y: 295 }, { x: 430, y: 330 }, { x: 360, y: 420 },
        { x: 260, y: 440 }, { x: 200, y: 340 }, { x: 245, y: 210 }, { x: 330, y: 150 },
        { x: 430, y: 500 }, { x: 535, y: 545 },
      ],
      littoral: [
        { x: 420, y: 420 }, { x: 490, y: 350 }, { x: 330, y: 470 }, { x: 430, y: 510 },
        { x: 545, y: 290 }, { x: 600, y: 500 }, { x: 680, y: 340 }, { x: 690, y: 200 },
        { x: 350, y: 220 }, { x: 610, y: 430 },
      ],
      centre: [
        { x: 450, y: 335 }, { x: 520, y: 280 }, { x: 390, y: 360 }, { x: 440, y: 420 },
        { x: 600, y: 430 }, { x: 540, y: 170 }, { x: 330, y: 270 }, { x: 650, y: 220 },
        { x: 300, y: 500 }, { x: 560, y: 520 },
      ],
      north_west: [
        { x: 410, y: 330 }, { x: 540, y: 270 }, { x: 350, y: 240 }, { x: 460, y: 420 },
        { x: 630, y: 290 }, { x: 305, y: 380 }, { x: 470, y: 220 }, { x: 560, y: 380 },
        { x: 680, y: 210 }, { x: 430, y: 500 },
      ],
      west: [
        { x: 610, y: 280 }, { x: 430, y: 340 }, { x: 350, y: 390 }, { x: 520, y: 430 },
        { x: 270, y: 310 }, { x: 640, y: 510 }, { x: 560, y: 180 }, { x: 480, y: 250 },
        { x: 310, y: 230 }, { x: 420, y: 520 },
      ],
      north: [
        { x: 420, y: 330 }, { x: 640, y: 360 }, { x: 300, y: 250 }, { x: 500, y: 440 },
        { x: 690, y: 480 }, { x: 570, y: 460 }, { x: 590, y: 220 }, { x: 360, y: 420 },
        { x: 410, y: 180 }, { x: 200, y: 500 },
      ],
      far_north: [
        { x: 480, y: 270 }, { x: 310, y: 380 }, { x: 520, y: 430 }, { x: 630, y: 370 },
        { x: 490, y: 60 }, { x: 570, y: 160 }, { x: 390, y: 220 }, { x: 540, y: 330 },
        { x: 220, y: 420 }, { x: 660, y: 260 },
      ],
      adamawa: [
        { x: 470, y: 270 }, { x: 630, y: 280 }, { x: 420, y: 210 }, { x: 560, y: 340 },
        { x: 310, y: 460 }, { x: 230, y: 320 }, { x: 500, y: 470 }, { x: 660, y: 360 },
        { x: 360, y: 170 }, { x: 280, y: 560 },
      ],
      east: [
        { x: 440, y: 390 }, { x: 740, y: 440 }, { x: 380, y: 220 }, { x: 320, y: 150 },
        { x: 560, y: 470 }, { x: 530, y: 230 }, { x: 260, y: 360 }, { x: 650, y: 300 },
        { x: 700, y: 190 }, { x: 440, y: 520 },
      ],
      south: [
        { x: 240, y: 370 }, { x: 270, y: 280 }, { x: 530, y: 320 }, { x: 270, y: 490 },
        { x: 220, y: 430 }, { x: 640, y: 290 }, { x: 400, y: 420 }, { x: 520, y: 170 },
        { x: 700, y: 360 }, { x: 460, y: 610 },
      ],
    };

    const regionPoints = regionMissionPoints[regionId] || [
      { x: 250, y: 180 }, { x: 320, y: 220 }, { x: 400, y: 260 }, { x: 470, y: 320 },
      { x: 260, y: 350 }, { x: 340, y: 420 }, { x: 440, y: 450 }, { x: 570, y: 330 },
      { x: 585, y: 520 }, { x: 640, y: 190 },
    ];

    if (missionsInRegion.length > 0) {
      return missionsInRegion.map((mission, index) => {
        const point = regionPoints[index % regionPoints.length] ?? {
          x: 300 + (index % 5) * 100,
          y: 180 + Math.floor(index / 5) * 120,
        };

        return {
          id: mission.id,
          name: mission.title,
          frenchName: mission.title,
          type: 'market',
          icon: mission.badgeIcon,
          cityOrTown: mission.city,
          tagline: mission.tagline,
          coordinates: point,
          description: mission.storyIntro,
          curriculumSubject: 'Mission Challenge',
          curriculumConcept: mission.tagline,
          facts: [mission.storyIntro, mission.storyOutro],
          isCurriculumMissionHub: true,
          missionId: mission.id,
          mapX: point.x,
          mapY: point.y,
        } as PopularSite;
      });
    }

    return regionData.popularSites.map((site) => {
      const coords = mapSpec.sitePositions[site.id] || {
        x: (site.coordinates.x / 100) * 900,
        y: (site.coordinates.y / 100) * 650,
      };
      return {
        ...site,
        mapX: coords.x,
        mapY: coords.y,
      };
    });
  })();

  return (
    <div
      id="region-explore-view"
      className="space-y-6"
    >
      {/* Top RPG Header Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white p-5 sm:p-6 shadow-xl border border-emerald-800/40">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Back Button to Zoom Out of Region */}
            <button
              id="back-to-country-button"
              onClick={handleBackToCountry}
              disabled={isLeaving}
              className="group flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white/15 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-md transition-all duration-200 border-2 border-white/30 hover:border-emerald-400 active:scale-95 disabled:opacity-70 cursor-pointer"
              title="Zoom out of the region back to the whole country"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>{isLeaving ? 'Zooming out...' : '← Cameroon Map'}</span>
              <span className="hidden sm:inline text-xs text-emerald-200 font-normal">
                (Zoom Out)
              </span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">🗺️</span>
                <h1 className="text-xl sm:text-3xl font-black font-display tracking-tight text-white">
                  {regionData.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Cap: {regionData.capital}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
                {regionData.motto}
              </p>
            </div>
          </div>

          {/* Regional Guide Badge & Quick Audio Replay */}
          <div className="flex items-center gap-2.5 bg-emerald-900/60 px-3.5 py-2 rounded-2xl border border-emerald-700/50 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">
                  Guide: {guide.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-800 text-amber-300 font-bold">
                  {guide.gender === 'female' ? 'Female Guide' : 'Male Guide'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 truncate max-w-[200px]">
                {guide.role}
              </p>
            </div>

            <button
              onClick={handleReplaySpeech}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors ml-1"
              title="Replay guide greeting voice"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Regional Cartographic Map + Regional Sites Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Canvas Card (Identical structure and styling as Cameroon Country Map) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 relative">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {regionData.name} Regional Map
                </h2>
                <p className="text-xs text-slate-500">
                  Tap any mission hub to begin an adventure with Guide {guide.name}!
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              {regionMissionPins.length} Mission Hubs Mapped
            </span>
          </div>

          {/* Regional Map Viewport with True Seamless Zoom In/Out Camera Motion */}
          <div
            className={`relative w-full aspect-[4/5] sm:aspect-[16/11] bg-gradient-to-b from-sky-100/90 via-sky-50 to-slate-100 rounded-2xl border-2 border-slate-200/90 overflow-hidden flex items-center justify-center p-2 select-none shadow-inner transition-all duration-700 ${
              zoomPhase === 'entering'
                ? 'scale-90 opacity-40 blur-[1px]'
                : zoomPhase === 'leaving'
                ? 'scale-75 opacity-0 blur-sm'
                : 'scale-100 opacity-100'
            }`}
          >
            {/* Ambient Animated Clouds */}
            <div className="absolute top-4 left-[-8%] w-32 h-10 bg-white/70 backdrop-blur-xs rounded-full blur-[1px] shadow-sm pointer-events-none animate-pulse" />
            <div className="absolute top-28 right-4 w-28 h-10 bg-white/60 backdrop-blur-xs rounded-full blur-[1px] shadow-sm pointer-events-none" />

            {/* Geographical Waters & Border Annotations around the region */}
            {mapSpec.borderAnnotations.bottom && (
              <div className="absolute left-3 bottom-3 text-[10px] font-black tracking-wider text-sky-800/70 uppercase pointer-events-none">
                {mapSpec.borderAnnotations.bottom}
              </div>
            )}
            {mapSpec.borderAnnotations.top && (
              <div className="absolute right-4 top-3 text-[9px] font-bold tracking-wider text-slate-500 uppercase pointer-events-none text-right">
                {mapSpec.borderAnnotations.top}
              </div>
            )}
            {mapSpec.borderAnnotations.left && (
              <div className="absolute left-3 top-8 text-[9px] font-semibold text-slate-400 pointer-events-none">
                {mapSpec.borderAnnotations.left}
              </div>
            )}
            {mapSpec.borderAnnotations.right && (
              <div className="absolute right-3 bottom-10 text-[9px] font-semibold text-slate-400 pointer-events-none text-right">
                {mapSpec.borderAnnotations.right}
              </div>
            )}

            {/* Prominent Floating Back Arrow Button right on the Map */}
            <button
              id="map-floating-back-arrow-btn"
              onClick={handleBackToCountry}
              disabled={isLeaving}
              className="absolute top-3 left-3 z-30 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 hover:bg-emerald-600 text-slate-900 hover:text-white font-black text-xs shadow-lg border-2 border-emerald-500 backdrop-blur-sm transition-all duration-200 active:scale-95 group cursor-pointer disabled:opacity-75"
              title="Return to Cameroon Country Map"
            >
              <ArrowLeft className={`w-4 h-4 transition-transform ${isLeaving ? 'animate-pulse text-amber-500' : 'text-emerald-600 group-hover:text-white group-hover:-translate-x-1'}`} />
              <span>{isLeaving ? 'Saying goodbye...' : '← Zoom Out to Cameroon'}</span>
            </button>

            {/* Compass Rose */}
            <div className="absolute top-3 right-3 pointer-events-none opacity-40 z-20">
              <Compass className="w-6 h-6 text-emerald-700 animate-spin" style={{ animationDuration: '24s' }} />
            </div>

            {/* AUTHENTIC GEOGRAPHIC SVG MAP OF THE REGION */}
            <svg
              viewBox={mapSpec.viewBox}
              className="w-full h-full max-h-[620px] drop-shadow-md transition-all duration-300"
            >
              <defs>
                {/* Regional Landmass Clip Path */}
                <clipPath id={`regionClip-${mapSpec.regionId}`}>
                  <path d={mapSpec.landmassPath} />
                </clipPath>

                {/* Biome Vertical Gradient */}
                <linearGradient
                  id={`regBiomesGrad-${mapSpec.regionId}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={mapSpec.biomeGradient.start} />
                  <stop offset="50%" stopColor={mapSpec.biomeGradient.middle} />
                  <stop offset="100%" stopColor={mapSpec.biomeGradient.end} />
                </linearGradient>

                {/* Regional Drop Shadow */}
                <filter
                  id={`regDropShadow-${mapSpec.regionId}`}
                  x="-10%"
                  y="-10%"
                  width="125%"
                  height="125%"
                >
                  <feDropShadow
                    dx="0"
                    dy="8"
                    stdDeviation="6"
                    floodColor="#064e3b"
                    floodOpacity="0.28"
                  />
                </filter>
              </defs>

              {/* 1. Water Bodies (Ocean bays, lakes, reservoirs) */}
              {mapSpec.waterBodies.map((water, idx) => (
                <g key={`water-${idx}`}>
                  <path
                    d={water.path}
                    fill={water.fill}
                    stroke={water.stroke || '#0284c7'}
                    strokeWidth="2"
                    opacity="0.85"
                  />
                  {water.label && (
                    <text
                      x={water.labelX || 100}
                      y={water.labelY || 100}
                      fontSize="13"
                      fill="#0369a1"
                      fontWeight="900"
                      textAnchor="middle"
                    >
                      {water.label}
                    </text>
                  )}
                </g>
              ))}

              {/* 2. Authentic Regional Landmass with Real Borders */}
              <g filter={`url(#regDropShadow-${mapSpec.regionId})`}>
                <path
                  d={mapSpec.landmassPath}
                  fill={`url(#regBiomesGrad-${mapSpec.regionId})`}
                  stroke="#047857"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />

                {/* Topographic Relief Contour Lines (Clipped to Region) */}
                <g clipPath={`url(#regionClip-${mapSpec.regionId})`} opacity="0.35">
                  {mapSpec.topographicLines.map((linePath, idx) => (
                    <path
                      key={`topo-line-${idx}`}
                      d={linePath}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeDasharray="6 6"
                    />
                  ))}
                </g>
              </g>

              {/* 3. Major Regional Rivers and Estuaries */}
              {mapSpec.rivers.map((river, idx) => (
                <g key={`river-${idx}`}>
                  <path
                    d={river.path}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth={river.width}
                    strokeLinecap="round"
                    className="opacity-75"
                  />
                  <text
                    x={river.labelX}
                    y={river.labelY}
                    fontSize="12"
                    fill="#0284c7"
                    fontWeight="bold"
                    className="opacity-85"
                  >
                    {river.name}
                  </text>
                </g>
              ))}

              {/* 4. Iconic Regional Physical Landmarks */}
              {mapSpec.landmarks.map((lm, idx) => (
                <g key={`landmark-${idx}`} transform={`translate(${lm.x}, ${lm.y})`} className="cursor-pointer group">
                  <text x="0" y="0" fontSize="26" textAnchor="middle" className="drop-shadow-sm">
                    {lm.icon}
                  </text>
                  <text
                    x="0"
                    y="20"
                    fontSize="11.5"
                    fill="#064e3b"
                    fontWeight="900"
                    textAnchor="middle"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    paintOrder="stroke fill"
                  >
                    {lm.name}
                  </text>
                  {lm.badge && (
                    <text
                      x="0"
                      y="32"
                      fontSize="9.5"
                      fill="#047857"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {lm.badge}
                    </text>
                  )}
                </g>
              ))}

              {/* 5. Educational Bold Regional Typography Watermark */}
              <g id="regional-watermark" className="pointer-events-none select-none">
                <g transform={`translate(${mapSpec.watermark.x}, ${mapSpec.watermark.y})`}>
                  <text
                    x="0"
                    y="0"
                    fontSize="32"
                    fontWeight="900"
                    fill="#047857"
                    stroke="#ffffff"
                    strokeWidth="5"
                    paintOrder="stroke fill"
                    textAnchor="middle"
                    letterSpacing="3"
                  >
                    {mapSpec.watermark.french}
                  </text>
                  <text
                    x="0"
                    y="22"
                    fontSize="16"
                    fontWeight="800"
                    fill="#065f46"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    paintOrder="stroke fill"
                    textAnchor="middle"
                  >
                    {mapSpec.watermark.english}
                  </text>
                </g>
              </g>

              {/* 6. Quest Pathway Connecting Popular Sites in the Region */}
              {regionMissionPins.map((site, idx) => {
                if (idx === 0) return null;
                const prev = regionMissionPins[idx - 1];
                return (
                  <line
                    key={`site-trail-${site.id}`}
                    x1={prev.mapX}
                    y1={prev.mapY}
                    x2={site.mapX}
                    y2={site.mapY}
                    stroke="#f59e0b"
                    strokeWidth="3.5"
                    strokeDasharray="8 6"
                    strokeOpacity="0.85"
                  />
                );
              })}

              {/* 7. Interactive Quest Pins for Regional Mission Hubs */}
              {regionMissionPins.map((site) => {
                const isSelected = selectedSite?.id === site.id;
                const isHovered = hoveredSite?.id === site.id;

                return (
                  <g
                    key={site.id}
                    id={`site-pin-${site.id}`}
                    transform={`translate(${site.mapX}, ${site.mapY})`}
                    onClick={() => handleSelectSite(site)}
                    onMouseEnter={() => {
                      playHoverSound();
                      setHoveredSite(site);
                    }}
                    onMouseLeave={() => setHoveredSite(null)}
                    className="cursor-pointer group select-none"
                  >
                    {/* Glowing beacon ring for active/selected pin */}
                    {(isSelected || isHovered) && (
                      <circle
                        r={isSelected ? '56' : '44'}
                        fill="none"
                        stroke={isSelected ? '#10b981' : '#f59e0b'}
                        strokeWidth="4.5"
                        className="animate-ping opacity-65"
                      />
                    )}

                    {/* Ground shadow under pin */}
                    <ellipse rx="36" ry="14" fill="#0f172a" opacity="0.35" cy="12" />

                    {/* Pin Circle Body */}
                    <circle
                      r={isSelected ? '36' : '28'}
                      fill={
                        site.isCurriculumMissionHub
                          ? '#f59e0b'
                          : isSelected
                          ? '#059669'
                          : '#064e3b'
                      }
                      stroke="#ffffff"
                      strokeWidth={isSelected ? '4.5' : '3.5'}
                      className="transition-transform group-hover:scale-115 shadow-xl"
                    />

                    {/* Inner Badge Icon */}
                    <text
                      x="0"
                      y="8"
                      fontSize="22"
                      textAnchor="middle"
                      className="select-none pointer-events-none"
                    >
                      {site.icon}
                    </text>

                    {/* Touch hit area */}
                    <circle r="48" fill="transparent" />

                    {/* Site Label Banner Pill */}
                    <g transform="translate(0, -52)">
                      <rect
                        x="-75"
                        y="-20"
                        width="150"
                        height="40"
                        rx="12"
                        fill={isSelected ? '#064e3b' : '#ffffff'}
                        stroke={isSelected ? '#34d399' : '#cbd5e1'}
                        strokeWidth={isSelected ? '2.5' : '1.8'}
                        filter="drop-shadow(0 3px 6px rgba(0,0,0,0.3))"
                      />
                      <text
                        x="0"
                        y="-3"
                        fontSize="13.5"
                        fontWeight="900"
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : '#0f172a'}
                        className="select-none pointer-events-none"
                      >
                        {site.name.length > 17
                          ? site.name.slice(0, 16) + '…'
                          : site.name}
                      </text>
                      <text
                        x="0"
                        y="12"
                        fontSize="10"
                        fontWeight="800"
                        textAnchor="middle"
                        fill={isSelected ? '#6ee7b7' : '#047857'}
                        className="select-none pointer-events-none tracking-wider uppercase"
                      >
                        {site.cityOrTown}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* 8. Regional Guide Avatar stationed on the map */}
              <g transform={`translate(${guidePos.x}, ${guidePos.y})`} className="cursor-pointer">
                {/* Ground shadow under guide */}
                <ellipse rx="32" ry="12" fill="#0f172a" opacity="0.3" cy="18" />

                {/* Avatar representation */}
                <foreignObject x="-45" y="-55" width="90" height="90">
                  <div className="w-full h-full flex items-center justify-center">
                    <RegionalGuideAvatar
                      guide={guide}
                      isSpeaking={isSpeaking}
                      size="sm"
                      className="scale-90"
                    />
                  </div>
                </foreignObject>

                {/* Guide Name Tag */}
                <g transform="translate(0, 36)">
                  <rect
                    x="-55"
                    y="-10"
                    width="110"
                    height="20"
                    rx="8"
                    fill="#064e3b"
                    stroke="#34d399"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="4"
                    fontSize="10.5"
                    fontWeight="bold"
                    fill="#ffffff"
                    textAnchor="middle"
                  >
                    Guide {guide.name}
                  </text>
                </g>
              </g>
            </svg>

            {/* Guide Interactive Speech Bubble Dialogue at bottom of map */}
            {showSpeechBubble ? (
              <div className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-6 bg-white/98 backdrop-blur-md rounded-2xl border-2 border-emerald-500 p-3.5 sm:p-4 shadow-xl z-20">
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <RegionalGuideAvatar
                      guide={guide}
                      isSpeaking={isSpeaking}
                      size="sm"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Guide {guide.name} says:
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleReplaySpeech}
                          className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          title="Replay guide audio"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setShowSpeechBubble(false)}
                          className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Close guide message"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                      "{currentSpeech || initialGreeting}"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowSpeechBubble(true)}
                className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-20 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white/85 px-3 py-2 text-xs font-bold text-emerald-800 shadow-lg backdrop-blur-sm hover:bg-emerald-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Open Guide Message
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Popular Sites Directory & Curriculum Quest Launcher */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Site Details Card OR Regional Highlights List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            {selectedSite ? (
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Mission • {selectedSite.cityOrTown}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                      {selectedSite.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedSite(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedSite.description}
                </p>

                {/* Didactic Key Facts */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    Mission Brief & Curriculum Facts:
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                    {selectedSite.facts.map((fact, i) => (
                      <li key={i}>{fact}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-1 flex flex-col gap-2">
                  <button
                    onClick={() => handleReadSiteFactsAloud(selectedSite)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    Listen to Mission Brief with Guide {guide.name}
                  </button>

                  {associatedMission && (
                    <button
                      onClick={() => onLaunchMission(associatedMission)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Launch Curriculum Challenge ({associatedMission.questions.length} Questions)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Mission Hubs in {regionData.name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Tap to view
                  </span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {regionMissionPins.map((site) => (
                    <button
                      key={site.id}
                      onClick={() => handleSelectSite(site)}
                      className="w-full text-left p-3 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-start gap-3 group"
                    >
                      <span className="text-xl shrink-0 p-1.5 rounded-xl bg-slate-100 group-hover:bg-white transition-colors">
                        {site.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-800">
                          {site.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {site.tagline}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {associatedMission && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onLaunchMission(associatedMission)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Start Regional Mission Quest
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Guide Profile & Lore Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200/70 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Meet Your Guide: {guide.name}</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              {guide.bio}
            </p>
            <div className="pt-1 text-[11px] text-emerald-800 font-medium italic">
              Outfit: {guide.outfitDescription}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
