import React, { useState, useEffect, useCallback } from 'react';
import { LocationMission, PupilProfile } from '../types';
import { CAMEROON_MISSIONS } from '../data/cameroonLocations';
import { MapAvatar } from './MapAvatar';
import { TalkingPupilCard } from './TalkingPupilCard';
import { BgmSoundSelector } from './BgmSoundSelector';
import { RegionMapView } from './RegionMapView';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Star,
  Play,
  Trophy,
  Coins,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Sparkles,
  Award,
  X,
  Navigation,
} from 'lucide-react';
import {
  playClickSound,
  playHoverSound,
  playWhooshSound,
  playZoomInSound,
  playZoomOutSound,
} from '../utils/audio';
import { speakAvatarText, stopSpeech } from '../utils/speech';

interface CameroonMapProps {
  profile: PupilProfile;
  onLaunchMission: (mission: LocationMission) => void;
}

// True cartographic polygon of Cameroon outline derived from geographic coordinates
const CAMEROON_EXACT_BORDER_PATH =
  'M 537.7,1191.9 L 524.5,1186.0 L 461.5,1199.9 L 396.9,1185.4 L 346.4,1192.5 L 173.4,1190.0 L 188.9,1104.9 L 147.3,1033.7 L 98.8,1015.4 L 77.2,967.1 L 50.0,951.6 L 51.2,921.8 L 78.6,845.5 L 129.1,741.5 L 159.9,740.6 L 223.3,677.5 L 263.6,675.7 L 323.3,720.0 L 396.3,683.6 L 406.2,638.8 L 430.1,595.4 L 446.6,540.9 L 503.5,496.5 L 524.9,421.0 L 547.5,397.0 L 562.5,341.0 L 590.6,272.2 L 680.1,188.7 L 685.8,152.9 L 697.4,133.4 L 655.3,90.5 L 658.7,56.2 L 688.7,50.0 L 731.0,119.0 L 738.1,190.6 L 734.2,262.2 L 792.1,360.1 L 732.7,359.1 L 702.7,366.8 L 654.2,355.9 L 631.1,406.8 L 693.9,469.7 L 740.2,488.0 L 755.2,532.6 L 788.7,607.0 L 772.0,636.2 L 718.5,745.4 L 693.0,765.0 L 684.8,848.5 L 695.4,893.9 L 686.8,926.1 L 737.1,982.4 L 746.2,1021.1 L 785.4,1076.7 L 834.0,1111.4 L 838.8,1160.6 L 850.0,1191.8 L 842.4,1250.0 L 757.9,1224.5 L 671.9,1196.1 L 537.7,1191.9 Z';

export const CameroonMap: React.FC<CameroonMapProps> = ({
  profile,
  onLaunchMission,
}) => {
  const [selectedMission, setSelectedMission] = useState<LocationMission>(
    CAMEROON_MISSIONS[0]
  );
  const [hoveredMission, setHoveredMission] = useState<LocationMission | null>(null);
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);

  // Avatar state on the map
  const [avatarCurrentPos, setAvatarCurrentPos] = useState<{ x: number; y: number }>(
    CAMEROON_MISSIONS[0].coordinates
  );
  const [avatarTargetPos, setAvatarTargetPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [avatarTargetMission, setAvatarTargetMission] = useState<LocationMission | null>(
    null
  );
  // Arrived journey modal prompt
  const [embarkPromptMission, setEmbarkPromptMission] = useState<LocationMission | null>(
    null
  );

  // Active zoomed-in regional exploration view
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);

  // Camera zoom animation states: 'country' | 'zooming-in' | 'zooming-out'
  const [zoomState, setZoomState] = useState<'country' | 'zooming-in' | 'zooming-out'>('country');
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const handleSelectMission = (mission: LocationMission) => {
    playClickSound();
    playWhooshSound();
    stopSpeech();
    setSelectedMission(mission);
    setEmbarkPromptMission(null);

    // Command the avatar to run to this mission!
    setAvatarTargetPos({ ...mission.coordinates });
    setAvatarTargetMission(mission);
  };

  const handleAvatarArrival = useCallback((mission: LocationMission) => {
    setAvatarCurrentPos({ ...mission.coordinates });
    setAvatarTargetPos(null);
    setAvatarTargetMission(null);
    // Show the embark journey question modal!
    setEmbarkPromptMission(mission);

    // Avatar reads the arrival text aloud to the pupil at a calm, natural pace
    const arrivalSpeech = `Arrived at ${mission.city}! Explore the ${mission.city} region? ${mission.title}. Your guide for this journey will be ${mission.guideName}.`;
    speakAvatarText(arrivalSpeech, {
      rate: 0.84,
      pitch: 1.06,
    });
  }, []);

  const handleConfirmEmbark = (mission: LocationMission) => {
    playClickSound();
    setEmbarkPromptMission(null);

    // Calculate zoom origin at the target region's geographic coordinates in the 920x1300 SVG coordinate space
    const originX = (mission.coordinates.x / 920) * 100;
    const originY = (mission.coordinates.y / 1300) * 100;
    setZoomOrigin({ x: originX, y: originY });

    // MANDATE: "Instead of of the country avatar to say 'yes' when a region is clicked on to embark on that region, say 'let's go'"
    speakAvatarText("Let's go!", {
      rate: 0.88,
      pitch: 1.1,
    });

    // Play tactile zoom-in sound effect
    playZoomInSound();

    // Trigger visual camera zoom-in into that region's coordinate space
    setZoomState('zooming-in');

    // Smoothly transition into the regional map after camera dives into the region
    setTimeout(() => {
      setActiveRegionId(mission.region);
      setZoomState('country');
    }, 750);
  };

  const handleReturnFromRegion = () => {
    // Set origin to the active region coordinates for smooth zoom-out
    const mission =
      CAMEROON_MISSIONS.find((m) => m.region === activeRegionId) || selectedMission;
    const originX = (mission.coordinates.x / 920) * 100;
    const originY = (mission.coordinates.y / 1300) * 100;
    setZoomOrigin({ x: originX, y: originY });

    setActiveRegionId(null);
    setZoomState('zooming-out');

    // Smoothly settle back to full country scale
    setTimeout(() => {
      setZoomState('country');
    }, 750);
  };

  const handleExploreOtherCities = () => {
    playClickSound();
    // Avatar says "Okay"
    speakAvatarText("Okay!", {
      rate: 0.86,
      pitch: 1.08,
    });
    setEmbarkPromptMission(null);
  };

  const handleHoverMission = (mission: LocationMission) => {
    playHoverSound();
    setHoveredMission(mission);
  };

  const isCompleted = (missionId: string) =>
    profile.completedMissionIds.includes(missionId);

  const countryMapMissions = Array.from(
    new Map(CAMEROON_MISSIONS.map((mission) => [mission.region, mission])).values()
  );

  const filteredMissions = countryMapMissions.filter((m) =>
    filterRegion === 'all' ? true : m.region === filterRegion
  );

  // If a region is actively being explored, render the regional map view with the regional guide avatar!
  if (activeRegionId) {
    return (
      <RegionMapView
        regionId={activeRegionId}
        profile={profile}
        onBackToCountry={handleReturnFromRegion}
        onLaunchMission={onLaunchMission}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Game RPG Header & Cameroon Landscape Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white p-4 sm:p-6 lg:p-8 shadow-xl border border-emerald-800/40">
        {/* Animated Background Atmosphere Stars & Ambient Glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4 xl:gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] sm:text-xs font-bold text-emerald-300">
              <Compass
                className="w-3.5 h-3.5 text-amber-300 animate-spin"
                style={{ animationDuration: '14s' }}
              />
              <span>Interactive Cameroon World Quest • Africa in Miniature</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-4xl font-black font-display tracking-tight text-white drop-shadow-sm">
              Explore the 10 Regions of Cameroon
            </h1>

            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
              Tap any regional hub on Cameroon's authentic map! Your scholar avatar will run to the city and invite you to embark on local Common Entrance and FSLC curriculum quests.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-emerald-200">
              <span className="flex items-center gap-1.5 bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {profile.completedMissionIds.length} of {CAMEROON_MISSIONS.length} Hubs Conquered
              </span>

              <span className="flex items-center gap-1.5 bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {profile.unlockedBadges.length} Cultural Crests Earned
              </span>
            </div>
          </div>

          {/* Background Sounds & Atmosphere Switcher — full width on mobile, fixed width on XL */}
          <div className="w-full xl:w-[380px] shrink-0">
            <BgmSoundSelector className="w-full" />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Cameroon Map + Mission Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Map Canvas Card */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 lg:p-6 shadow-sm space-y-4 relative">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  Cameroon Cartographic Quest Map
                </h2>
                <p className="text-xs text-slate-500">
                  Tap any city: watch your avatar sprint to the location to embark!
                </p>
              </div>
            </div>

            {/* Region selector filter */}
            <select
              id="map-filter-region-select"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-emerald-600"
            >
              <option value="all">All 10 Regions</option>
              <option value="south_west">South West (Buea/Limbe)</option>
              <option value="littoral">Littoral (Douala)</option>
              <option value="centre">Centre (Yaoundé)</option>
              <option value="north_west">North West (Bamenda)</option>
              <option value="west">West (Bafoussam)</option>
              <option value="north">North (Garoua)</option>
              <option value="far_north">Far North (Maroua)</option>
              <option value="adamawa">Adamawa (Ngaoundéré)</option>
              <option value="east">East (Bertoua)</option>
              <option value="south">South (Ebolowa)</option>
            </select>
          </div>

          {/* Map Viewport & Game Stage */}
          <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] bg-gradient-to-b from-sky-100/90 via-sky-50 to-slate-100 rounded-2xl border-2 border-slate-200/90 overflow-hidden flex items-center justify-center p-2 select-none shadow-inner">
            {/* Ambient Animated Clouds */}
            <div className="absolute top-4 left-[-10%] w-32 h-10 bg-white/70 backdrop-blur-xs rounded-full blur-[1px] shadow-sm pointer-events-none animate-pulse" />
            <div className="absolute top-36 right-4 w-28 h-10 bg-white/60 backdrop-blur-xs rounded-full blur-[1px] shadow-sm pointer-events-none" />

            {/* Geographical Waters & Border Annotations */}
            <div className="absolute left-2.5 bottom-12 text-[10px] font-black tracking-widest text-sky-700/60 uppercase rotate-[-30deg] pointer-events-none">
              Gulf of Guinea (Atlantic Ocean) 🌊
            </div>
            <div className="absolute right-4 top-4 text-[10px] font-extrabold tracking-wider text-amber-800/70 uppercase pointer-events-none">
              Lake Chad Basin
            </div>
            <div className="absolute left-3 top-10 text-[9px] font-semibold text-slate-400 pointer-events-none">
              Nigeria Border
            </div>
            <div className="absolute right-3 bottom-14 text-[9px] font-semibold text-slate-400 pointer-events-none text-right">
              C.A.R. & Congo Basin
            </div>

            {/* EXACT GEOGRAPHIC SVG MAP OF CAMEROON (ViewBox: 0 0 920 1300) */}
            <svg
              viewBox="0 0 920 1300"
              className="w-full h-full max-h-[620px] drop-shadow-md"
              style={{
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                transform:
                  zoomState === 'zooming-in'
                    ? 'scale(3.6)'
                    : zoomState === 'zooming-out'
                    ? 'scale(1)'
                    : 'scale(1)',
                opacity: zoomState === 'zooming-in' ? 0.35 : 1,
                transition:
                  zoomState === 'zooming-in'
                    ? 'transform 750ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease-in-out'
                    : zoomState === 'zooming-out'
                    ? 'transform 750ms cubic-bezier(0.16, 1, 0.3, 1), opacity 700ms ease-in-out'
                    : 'transform 300ms ease-out',
              }}
            >
              <defs>
                {/* Clip-Path of Cameroon's exact real border */}
                <clipPath id="cameroonCountryClip">
                  <path d={CAMEROON_EXACT_BORDER_PATH} />
                </clipPath>

                {/* Biome Vertical Gradient across Cameroon */}
                <linearGradient id="cameroonBiomesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  {/* Far North Lake Chad / Sahel sand */}
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="16%" stopColor="#fde047" />
                  {/* Northern Savanna (Garoua/Bénoué) */}
                  <stop offset="32%" stopColor="#86efac" />
                  {/* High Adamawa Plateau (Ngaoundéré) */}
                  <stop offset="52%" stopColor="#34d399" />
                  {/* Western Highlands & Grassfields (Bamenda/Bafoussam) */}
                  <stop offset="68%" stopColor="#10b981" />
                  {/* Equatorial Rainforest & Southern Belt */}
                  <stop offset="85%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>

                {/* Map drop shadow */}
                <filter id="countryDropShadow" x="-10%" y="-10%" width="125%" height="125%">
                  <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#064e3b" floodOpacity="0.28" />
                </filter>
              </defs>

              {/* 1. Lake Chad Waters at northern apex */}
              <path
                d="M 660,25 Q 710,10 740,40 Q 720,80 670,75 Z"
                fill="#38bdf8"
                opacity="0.85"
                stroke="#0284c7"
                strokeWidth="2"
              />
              <text
                x="705"
                y="50"
                fontSize="14"
                fill="#0369a1"
                fontWeight="900"
                textAnchor="middle"
              >
                Lake Chad
              </text>

              {/* 2. Authentic Cameroon Country Landmass with Real Borders */}
              <g filter="url(#countryDropShadow)">
                {/* Solid Biome Landmass */}
                <path
                  d={CAMEROON_EXACT_BORDER_PATH}
                  fill="url(#cameroonBiomesGradient)"
                  stroke="#047857"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />

                {/* Terrain Texture & Topographic Contours (Clipped to Cameroon) */}
                <g clipPath="url(#cameroonCountryClip)" opacity="0.35">
                  {/* Regional dividing contour curves */}
                  <path
                    d="M 440,540 Q 600,500 750,530"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                  />
                  <path
                    d="M 320,720 Q 500,680 720,740"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                  />
                  <path
                    d="M 220,900 Q 400,880 680,920"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                  />
                </g>
              </g>

              {/* 3. Major Cameroon River Arteries */}
              {/* Sanaga River (Longest river in Cameroon, flowing past Centre to Douala Atlantic) */}
              <path
                d="M 590,680 Q 480,820 370,950 Q 280,990 180,1005"
                fill="none"
                stroke="#0284c7"
                strokeWidth="4"
                strokeLinecap="round"
                className="opacity-75"
              />
              <text
                x="410"
                y="910"
                fontSize="12"
                fill="#0284c7"
                fontWeight="bold"
                className="opacity-80"
              >
                Sanaga River
              </text>

              {/* Bénoué River (North Region flowing past Garoua) */}
              <path
                d="M 680,390 Q 570,430 440,460"
                fill="none"
                stroke="#0284c7"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="opacity-75"
              />
              <text
                x="560"
                y="415"
                fontSize="12"
                fill="#0284c7"
                fontWeight="bold"
                className="opacity-80"
              >
                Bénoué River
              </text>

              {/* 4. Iconic Physical Landmarks */}
              {/* Mount Cameroon / Mount Fako (Active Volcano, 4,095m) */}
              <g transform="translate(135, 960)" className="cursor-pointer group">
                {/* Volcano Base and Shading */}
                <polygon points="0,-24 -22,12 22,12" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.5" />
                <polygon points="0,-24 0,12 22,12" fill="#7f1d1d" />
                {/* Glowing Volcano Crater Lava / Snow peak */}
                <circle cx="0" cy="-22" r="5" fill="#facc15" />
                <circle cx="0" cy="-32" r="4" fill="#e2e8f0" opacity="0.7" className="animate-ping" />
                <text
                  x="0"
                  y="26"
                  fontSize="12"
                  fill="#7f1d1d"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  Mt. Fako (4,095m) 🌋
                </text>
              </g>

              {/* Waza Wildlife Safari (Far North) */}
              <g transform="translate(665, 215)">
                <text x="0" y="0" fontSize="24" textAnchor="middle">
                  🐘
                </text>
                <text
                  x="0"
                  y="20"
                  fontSize="14"
                  fill="#78350f"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Waza Reserve 🐘
                </text>
              </g>

              {/* 4b. Authentic 10 Administrative Regions of Cameroon (Bold Educational Typography) */}
              <g id="cameroon-region-watermarks" className="pointer-events-none select-none">
                {/* Far North */}
                <g transform="translate(675, 145)">
                  <text
                    x="0"
                    y="0"
                    fontSize="28"
                    fontWeight="900"
                    fill="#92400e"
                    stroke="#ffffff"
                    strokeWidth="4.5"
                    paintOrder="stroke fill"
                    textAnchor="middle"
                    letterSpacing="3"
                  >
                    EXTRÊME-NORD
                  </text>
                  <text x="0" y="18" fontSize="15" fontWeight="800" fill="#b45309" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke fill" textAnchor="middle">
                    (Far North Region)
                  </text>
                </g>

                {/* North */}
                <g transform="translate(595, 335)">
                  <text
                    x="0"
                    y="0"
                    fontSize="30"
                    fontWeight="900"
                    fill="#15803d"
                    stroke="#ffffff"
                    strokeWidth="5"
                    paintOrder="stroke fill"
                    textAnchor="middle"
                    letterSpacing="4"
                  >
                    NORD
                  </text>
                  <text x="0" y="19" fontSize="15" fontWeight="800" fill="#166534" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke fill" textAnchor="middle">
                    (North Region)
                  </text>
                </g>

                {/* Adamawa */}
                <g transform="translate(535, 540)">
                  <text
                    x="0"
                    y="0"
                    fontSize="30"
                    fontWeight="900"
                    fill="#047857"
                    stroke="#ffffff"
                    strokeWidth="5"
                    paintOrder="stroke fill"
                    textAnchor="middle"
                    letterSpacing="3"
                  >
                    ADAMAOUA
                  </text>
                  <text x="0" y="19" fontSize="15" fontWeight="800" fill="#065f46" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke fill" textAnchor="middle">
                    (Adamawa Plateau)
                  </text>
                </g>

                {/* North West */}
                <g transform="translate(230, 635)">
                  <text
                    x="0"
                    y="0"
                    fontSize="26"
                    fontWeight="900"
                    fill="#047857"
                    stroke="#ffffff"
                    strokeWidth="4.5"
                    paintOrder="stroke fill"
                    textAnchor="middle"
                    letterSpacing="2"
                  >
                    NORD-OUEST
                  </text>
                  <text x="0" y="17" fontSize="14" fontWeight="800" fill="#065f46" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke fill" textAnchor="middle">
                    (North West)
                  </text>
                </g>

                {/* West */}
                <g transform="translate(325, 725)">
                  <text
                    x="0"
                    y="0"
                    fontSize="26"
                    fontWeight="900"
                    fill="#047857"
                    stroke="#ffffff"
                    strokeWidth="4.5"
                    paintOrder="stroke fill"
                    textAnchor="middle"
                    letterSpacing="2"
                  >
                    OUEST
                  </text>
                  <text x="0" y="17" fontSize="14" fontWeight="800" fill="#065f46" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke fill" textAnchor="middle">
                    (West Region)
                  </text>
                </g>

                {/* South West */}
                <g transform="translate(95, 875)">
                  <text
                    x="0"
                    y="0"
                    fontSize="26"
                    fontWeight="900"
                    fill="#047857"
                    stroke="#ffffff"
                    strokeWidth="4.5"
                    paintOrder="stroke fill"
                    textAnchor="middle"
                    letterSpacing="2"
                  >
                    SUD-OUEST
                  </text>
                  <text x="0" y="17" fontSize="14" fontWeight="800" fill="#065f46" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke fill" textAnchor="middle">
                    (South West)
                  </text>
                </g>

                {/* Littoral */}
                <g transform="translate(210, 930)">
                  <text
                    x="0"
                    y="0"
                    fontSize="28"
                    fontWeight="900"
                    fill="#047857"
                    stroke="#ffffff"
                    strokeWidth="4.5"
                    paintOrder="stroke fill"
                    textAnchor="middle"
                    letterSpacing="2"
                  >
                    LITTORAL
                  </text>
                  <text x="0" y="17" fontSize="14" fontWeight="800" fill="#047857" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke fill" textAnchor="middle">
                    (Littoral Region)
                  </text>
                </g>

                {/* Centre */}
                <g transform="translate(370, 935)">
                  <text
                    x="0"
                    y="0"
                    fontSize="30"
                    fontWeight="900"
                    fill="#065f46"
                    stroke="#ffffff"
                    strokeWidth="5"
                    paintOrder="stroke fill"
                    textAnchor="middle"
                    letterSpacing="3"
                  >
                    CENTRE
                  </text>
                  <text x="0" y="19" fontSize="15" fontWeight="800" fill="#047857" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke fill" textAnchor="middle">
                    (Centre Region)
                  </text>
                </g>

                {/* East */}
                <g transform="translate(620, 870)">
                  <text
                    x="0"
                    y="0"
                    fontSize="32"
                    fontWeight="900"
                    fill="#064e3b"
                    stroke="#ffffff"
                    strokeWidth="5.5"
                    paintOrder="stroke fill"
                    textAnchor="middle"
                    letterSpacing="4"
                  >
                    EST
                  </text>
                  <text x="0" y="20" fontSize="15" fontWeight="800" fill="#065f46" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke fill" textAnchor="middle">
                    (East Rainforest Region)
                  </text>
                </g>

                {/* South */}
                <g transform="translate(380, 1195)">
                  <text
                    x="0"
                    y="0"
                    fontSize="30"
                    fontWeight="900"
                    fill="#064e3b"
                    stroke="#ffffff"
                    strokeWidth="5"
                    paintOrder="stroke fill"
                    textAnchor="middle"
                    letterSpacing="3"
                  >
                    SUD
                  </text>
                  <text x="0" y="19" fontSize="15" fontWeight="800" fill="#065f46" stroke="#ffffff" strokeWidth="2.5" paintOrder="stroke fill" textAnchor="middle">
                    (South Region)
                  </text>
                </g>
              </g>

              {/* 5. Animated Quest Pathway connecting regional hubs */}
              {countryMapMissions.map((m, idx) => {
                if (idx === 0) return null;
                const prev = countryMapMissions[idx - 1];
                return (
                  <line
                    key={`quest-trail-${m.id}`}
                    x1={prev.coordinates.x}
                    y1={prev.coordinates.y}
                    x2={m.coordinates.x}
                    y2={m.coordinates.y}
                    stroke="#f59e0b"
                    strokeWidth="4"
                    strokeDasharray="10 8"
                    strokeOpacity="0.85"
                    className="transition-all"
                  />
                );
              })}

              {/* 6. Interactive Quest Pins for Regional Cities with Large Select Circles & Labels */}
              {countryMapMissions.map((mission) => {
                const isSelected = selectedMission.id === mission.id;
                const isHovered = hoveredMission?.id === mission.id;
                const completed = isCompleted(mission.id);

                // For Limbe, place label banner below the pin to avoid collision with Buea
                const isLimbe = mission.id === 'mission-limbe';
                const labelTransform = isLimbe ? 'translate(0, 62)' : 'translate(0, -62)';

                return (
                  <g
                    key={mission.id}
                    id={`game-pin-${mission.id}`}
                    transform={`translate(${mission.coordinates.x}, ${mission.coordinates.y})`}
                    onClick={() => handleSelectMission(mission)}
                    onMouseEnter={() => handleHoverMission(mission)}
                    onMouseLeave={() => setHoveredMission(null)}
                    className="cursor-pointer group select-none"
                  >
                    {/* Glowing beacon ring for active/selected pin (Enlarged) */}
                    {(isSelected || isHovered) && (
                      <circle
                        r={isSelected ? '64' : '52'}
                        fill="none"
                        stroke={isSelected ? '#10b981' : '#f59e0b'}
                        strokeWidth="5"
                        className="animate-ping opacity-65"
                      />
                    )}

                    {/* Ground shadow under pin (Enlarged) */}
                    <ellipse rx="40" ry="15" fill="#0f172a" opacity="0.35" cy="12" />

                    {/* Pin Circle Body - Significantly Increased Size */}
                    <circle
                      r={isSelected ? '42' : '33'}
                      fill={
                        completed
                          ? '#f59e0b'
                          : isSelected
                          ? '#059669'
                          : '#064e3b'
                      }
                      stroke="#ffffff"
                      strokeWidth={isSelected ? '5' : '4'}
                      className="transition-transform group-hover:scale-115 shadow-xl"
                    />

                    {/* Inner Badge Icon or Star indicator (Enlarged) */}
                    {completed ? (
                      <text
                        x="0"
                        y="9"
                        fontSize="28"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontWeight="black"
                      >
                        ★
                      </text>
                    ) : (
                      <text
                        x="0"
                        y="8"
                        fontSize="24"
                        textAnchor="middle"
                        className="select-none pointer-events-none"
                      >
                        {mission.badgeIcon}
                      </text>
                    )}

                    {/* Generous touch/click hit area */}
                    <circle r="58" fill="transparent" />

                    {/* City & Region Label Banner - Significantly Increased Size and Readability */}
                    <g transform={labelTransform}>
                      <rect
                        x="-78"
                        y="-23"
                        width="156"
                        height="46"
                        rx="14"
                        fill={isSelected ? '#064e3b' : '#ffffff'}
                        stroke={isSelected ? '#34d399' : '#cbd5e1'}
                        strokeWidth={isSelected ? '2.5' : '1.8'}
                        filter="drop-shadow(0 3px 6px rgba(0,0,0,0.3))"
                      />
                      {/* City Name */}
                      <text
                        x="0"
                        y="-3"
                        fontSize="17.5"
                        fontWeight="900"
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : '#0f172a'}
                        className="select-none pointer-events-none"
                      >
                        {mission.city}
                      </text>
                      {/* Region Name */}
                      <text
                        x="0"
                        y="14"
                        fontSize="11.5"
                        fontWeight="800"
                        textAnchor="middle"
                        fill={isSelected ? '#6ee7b7' : '#047857'}
                        className="select-none pointer-events-none tracking-wider uppercase"
                      >
                        {mission.regionName.replace(' Region', '')}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* 7. Player Animated Avatar Running Across Cameroon! */}
              <MapAvatar
                profile={profile}
                currentPos={avatarCurrentPos}
                targetPos={avatarTargetPos}
                targetMission={avatarTargetMission}
                onArrival={handleAvatarArrival}
              />
            </svg>

            {/* Embarkation Speech Bubble Prompt with Talking Avatar beside it */}
            <AnimatePresence>
              {embarkPromptMission && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 12 }}
                  className="absolute bottom-3 left-3 right-3 sm:left-6 sm:right-6 bg-white/98 backdrop-blur-md rounded-3xl border-2 border-emerald-500 p-4 sm:p-5 shadow-2xl z-40"
                >
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                    {/* Animated Talking Pupil Character standing right next to the popup */}
                    <TalkingPupilCard
                      profile={profile}
                      speechTextToRead={`Arrived at ${embarkPromptMission.city}! Embark on the ${embarkPromptMission.city} mission? ${embarkPromptMission.title}. Your guide for this journey will be ${embarkPromptMission.guideName}.`}
                      className="shrink-0 w-full sm:w-36 md:w-40"
                    />

                    {/* Dialogue Details & Actions */}
                    <div className="flex-1 w-full space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] shadow-2xs">
                            <Navigation className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                            <span>Arrived at {embarkPromptMission.city}!</span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                            Embark on the {embarkPromptMission.city} Mission?
                          </h3>
                          <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                            "{embarkPromptMission.title}"
                          </p>
                        </div>

                        <button
                          onClick={handleExploreOtherCities}
                          title="Explore other cities"
                          className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Explicit Requirement: "your guide for this journey will be [Name]" */}
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 flex items-center gap-3 shadow-2xs">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-800 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
                          {embarkPromptMission.badgeIcon}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs sm:text-sm font-black text-emerald-950">
                            Your guide for this journey will be {embarkPromptMission.guideName}.
                          </p>
                          <p className="text-[11px] text-emerald-700 font-semibold">
                            Role: {embarkPromptMission.guideRole}
                          </p>
                        </div>
                      </div>

                      {/* Bounty & Confirm Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 shadow-2xs">
                          +{embarkPromptMission.xpReward} XP & +{embarkPromptMission.coinsReward} FCFA
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            id="embark-dialog-cancel-btn"
                            onClick={handleExploreOtherCities}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            Explore Other Cities 🗺️
                          </button>

                          <button
                            id="embark-dialog-launch-btn"
                            onClick={() => handleConfirmEmbark(embarkPromptMission)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Let's go! 🚀</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Map Legend */}
            <div className="absolute left-2.5 bottom-2.5 bg-white/95 backdrop-blur-md rounded-xl p-2.5 border border-slate-200 text-[10px] space-y-1 shadow-md">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-white">
                  ★
                </span>
                <span>Conquered Hub</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white" />
                <span>Selected Destination</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <span className="w-3 h-3 border border-red-500 bg-red-100 rotate-45" />
                <span>Mt. Fako (4,095m)</span>
              </div>
            </div>
          </div>

          {/* Quick Hub Scrollbar */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {filteredMissions.map((m) => {
              const active = selectedMission.id === m.id;
              const done = isCompleted(m.id);
              return (
                <button
                  key={`btn-scroll-${m.id}`}
                  onClick={() => handleSelectMission(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/30'
                      : done
                      ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {done ? (
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  ) : (
                    <span className="text-sm">{m.badgeIcon}</span>
                  )}
                  <span>{m.city}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mission Briefing Card on Right */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5">
          {/* Header & Location Identity */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                {selectedMission.regionName}
              </span>
              {isCompleted(selectedMission.id) ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  Mission Completed
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-500">
                  Ready for Exploration
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-2">
              {selectedMission.city}: {selectedMission.title}
            </h2>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              "{selectedMission.tagline}"
            </p>
          </div>

          {/* Guide dialogue box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200 relative shadow-2xs">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-800 text-white font-black text-base flex items-center justify-center shrink-0 shadow-md ring-2 ring-emerald-300">
                {selectedMission.guideName.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-slate-900">
                    {selectedMission.guideName}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded-sm">
                    {selectedMission.guideRole}
                  </span>
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed pt-0.5">
                  "{selectedMission.storyIntro}"
                </p>
              </div>
            </div>
          </div>

          {/* Examination competencies in this mission */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Exam Competencies in This Mission
            </h3>
            <div className="space-y-2">
              {selectedMission.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">{q.subjectLabel}</p>
                      <p className="text-[11px] text-slate-500">{q.topic}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                    +{q.points} XP
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mission completion rewards */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2.5 shadow-2xs">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Completion Bounty</span>
            </h4>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-amber-200">
                <span className="text-2xl">{selectedMission.badgeIcon}</span>
                <div className="truncate">
                  <p className="font-bold text-slate-900 text-xs truncate">
                    {selectedMission.badgeName}
                  </p>
                  <p className="text-[10px] text-amber-700 font-medium">Regional Crest</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-amber-200">
                <Coins className="w-5 h-5 text-amber-500 fill-amber-400" />
                <div>
                  <p className="font-black text-amber-950 text-xs">
                    +{selectedMission.coinsReward} FCFA
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    +{selectedMission.xpReward} Explorer XP
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button: Start Mission / Explore Region */}
          <button
            id={`launch-mission-${selectedMission.id}-btn`}
            onClick={() => {
              handleConfirmEmbark(selectedMission);
            }}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all group cursor-pointer hover:shadow-lg"
          >
            <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
            <span>Explore {selectedMission.city} & Region Map 🚀</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
