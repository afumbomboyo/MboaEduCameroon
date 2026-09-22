/**
 * Authentic Cartographic Regional Map Specifications for the 10 Regions of Cameroon.
 * Each region is crafted with the identical map structure and aesthetic as the Cameroon country map:
 * - Exact geographic landmass outline
 * - Biome terrain gradient & crisp cartographic boundary stroke
 * - Topographic contour curves & elevation relief
 * - Major river arteries & lakes
 * - Physical landmarks (volcanoes, waterfalls, reserves, palaces)
 * - Educational bilingual watermarks
 * - Bounding border annotations (neighboring regions, ocean, international borders)
 * - Precise coordinates for all popular sites in the 900x650 viewport
 */

export interface RegionalRiver {
  name: string;
  path: string;
  width: number;
  labelX: number;
  labelY: number;
}

export interface RegionalWaterBody {
  path: string;
  fill: string;
  stroke?: string;
  label?: string;
  labelX?: number;
  labelY?: number;
}

export interface RegionalLandmark {
  icon: string;
  name: string;
  x: number;
  y: number;
  badge?: string;
}

export interface RegionalMapSpec {
  regionId: string;
  name: string;
  frenchName: string;
  capital: string;
  viewBox: string;
  landmassPath: string;
  biomeGradient: {
    start: string;
    middle: string;
    end: string;
  };
  topographicLines: string[];
  rivers: RegionalRiver[];
  waterBodies: RegionalWaterBody[];
  landmarks: RegionalLandmark[];
  borderAnnotations: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  watermark: {
    french: string;
    english: string;
    x: number;
    y: number;
  };
  sitePositions: Record<string, { x: number; y: number }>;
}

export const CAMEROON_REGIONAL_MAP_SPECS: Record<string, RegionalMapSpec> = {
  south_west: {
    regionId: 'south_west',
    name: 'South West Region',
    frenchName: 'Région du Sud-Ouest',
    capital: 'Buea',
    viewBox: '0 0 900 650',
    // Authentic geographic boundary: Atlantic coast from Cape Debundscha/Limbe up past Bakassi & Ndian, bordered by Littoral and Western Highlands
    landmassPath:
      'M 180,610 C 130,580 90,520 80,440 C 70,360 110,290 140,240 C 170,190 220,130 300,90 C 370,60 480,50 560,90 C 640,130 710,180 760,250 C 790,300 820,380 810,460 C 800,530 740,580 670,610 C 580,640 480,630 390,640 C 300,650 230,630 180,610 Z',
    biomeGradient: {
      start: '#10b981', // Volcanic highlands
      middle: '#059669', // Rainforest & tea plantations
      end: '#047857', // Atlantic mangroves
    },
    topographicLines: [
      'M 240,480 Q 450,420 660,490',
      'M 300,360 Q 450,290 620,370',
      'M 350,260 Q 450,210 560,270',
      'M 380,180 Q 450,150 520,180',
    ],
    rivers: [
      {
        name: 'Meme River',
        path: 'M 220,240 Q 340,320 420,440',
        width: 4,
        labelX: 320,
        labelY: 330,
      },
      {
        name: 'Ndian Estuary River',
        path: 'M 180,380 Q 280,450 360,560',
        width: 3.5,
        labelX: 250,
        labelY: 480,
      },
    ],
    waterBodies: [
      {
        // Atlantic Ocean bay along the southwestern and southern edge
        path: 'M 0,460 Q 90,520 180,610 L 0,650 Z',
        fill: '#0284c7',
        label: 'Atlantic Ocean (Ambas Bay) 🌊',
        labelX: 80,
        labelY: 620,
      },
      {
        path: 'M 670,610 Q 750,630 900,650 L 900,580 Q 780,560 670,610 Z',
        fill: '#0369a1',
        label: 'Bight of Biafra Channel',
        labelX: 780,
        labelY: 625,
      },
    ],
    landmarks: [
      {
        icon: '🌋',
        name: 'Mt. Fako (4,095m)',
        x: 450,
        y: 290,
        badge: 'Active Volcano',
      },
      {
        icon: '🌊',
        name: 'Down Beach & Black Sands',
        x: 320,
        y: 520,
        badge: 'Volcanic Coast',
      },
      {
        icon: '🌧️',
        name: 'Debundscha (10,000mm Rain)',
        x: 170,
        y: 460,
        badge: 'Rain Station',
      },
      {
        icon: '🐒',
        name: 'Korup Ancient Rainforest',
        x: 300,
        y: 160,
        badge: '60M yr Biosphere',
      },
    ],
    borderAnnotations: {
      top: 'Nigeria Border (Cross River State)',
      right: 'Littoral Region & Wouri River',
      bottom: 'Gulf of Guinea (Atlantic Ocean) 🌊',
      left: 'Bakassi Peninsula & Bight of Biafra',
    },
    watermark: {
      french: 'SUD-OUEST',
      english: '(South West Region • Buea)',
      x: 450,
      y: 410,
    },
    sitePositions: {
      'sw-fako': { x: 450, y: 250 },
      'sw-buea-lodge': { x: 530, y: 280 },
      'sw-limbe-beach': { x: 380, y: 490 },
      'sw-bimbia': { x: 480, y: 550 },
      'sw-debundscha': { x: 210, y: 440 },
      'sw-korup': { x: 310, y: 150 },
    },
  },

  littoral: {
    regionId: 'littoral',
    name: 'Littoral Region',
    frenchName: 'Région du Littoral',
    capital: 'Douala',
    viewBox: '0 0 900 650',
    landmassPath:
      'M 160,590 C 120,530 110,440 140,360 C 180,280 250,210 340,150 C 430,100 550,80 640,110 C 730,150 790,220 810,310 C 830,400 810,490 750,560 C 680,620 570,640 480,630 C 370,640 260,630 160,590 Z',
    biomeGradient: {
      start: '#0284c7', // Wouri Estuary Atlantic
      middle: '#059669', // Coastal alluvial delta
      end: '#047857', // Rainforest & Sanaga basin
    },
    topographicLines: [
      'M 240,460 Q 460,400 680,470',
      'M 310,330 Q 480,270 650,340',
      'M 380,220 Q 500,180 620,230',
    ],
    rivers: [
      {
        name: 'Wouri River (Estuary Delta)',
        path: 'M 190,560 Q 320,440 450,330 Q 560,240 680,180',
        width: 6,
        labelX: 380,
        labelY: 410,
      },
      {
        name: 'Sanaga River Mouth (Edea)',
        path: 'M 540,590 Q 640,480 750,390',
        width: 4.5,
        labelX: 630,
        labelY: 510,
      },
    ],
    waterBodies: [
      {
        path: 'M 0,440 C 80,460 160,520 220,650 L 0,650 Z',
        fill: '#0284c7',
        label: 'Wouri Estuary (Atlantic Entry) 🌊',
        labelX: 90,
        labelY: 570,
      },
    ],
    landmarks: [
      {
        icon: '🌉',
        name: 'Wouri Bridge & Delta',
        x: 350,
        y: 440,
        badge: 'Iconic Bridge',
      },
      {
        icon: '🚢',
        name: 'Douala Autonomous Port',
        x: 410,
        y: 360,
        badge: 'Central Trade Hub',
      },
      {
        icon: '⚡',
        name: 'Edea Hydroelectric Dam',
        x: 620,
        y: 480,
        badge: 'Sanaga Power',
      },
      {
        icon: '🏞️',
        name: 'Lake Ossa Manatee Reserve',
        x: 660,
        y: 330,
        badge: 'Freshwater Sanctuary',
      },
    ],
    borderAnnotations: {
      top: 'West & Moungo Agricultural Belt',
      right: 'Centre Region (Sanaga Valley)',
      bottom: 'South Region & Kribi Coast',
      left: 'South West Region & Atlantic Ocean 🌊',
    },
    watermark: {
      french: 'LITTORAL',
      english: '(Littoral Region • Douala Port)',
      x: 450,
      y: 260,
    },
    sitePositions: {
      'lit-port': { x: 380, y: 400 },
      'lit-marche': { x: 460, y: 350 },
      'lit-wouri-bridge': { x: 330, y: 460 },
      'lit-palais-dika': { x: 440, y: 440 },
      'lit-edea-falls': { x: 610, y: 490 },
      'lit-lake-ossa': { x: 670, y: 340 },
    },
  },

  centre: {
    regionId: 'centre',
    name: 'Centre Region',
    frenchName: 'Région du Centre',
    capital: 'Yaoundé',
    viewBox: '0 0 900 650',
    landmassPath:
      'M 180,560 C 130,490 120,380 160,290 C 200,200 290,140 390,90 C 490,50 620,60 700,110 C 780,160 830,240 820,340 C 810,430 760,510 690,560 C 610,620 500,640 400,630 C 290,630 210,610 180,560 Z',
    biomeGradient: {
      start: '#10b981',
      middle: '#059669',
      end: '#047857',
    },
    topographicLines: [
      'M 240,470 Q 470,410 700,480',
      'M 300,340 Q 480,280 670,350',
      'M 370,220 Q 510,170 650,230',
    ],
    rivers: [
      {
        name: 'Nyong River (Southern Belt)',
        path: 'M 180,520 Q 360,550 550,510 Q 720,540 820,490',
        width: 4.5,
        labelX: 470,
        labelY: 535,
      },
      {
        name: 'Sanaga River (Northern Basin)',
        path: 'M 220,170 Q 420,200 640,160 Q 750,180 820,150',
        width: 5,
        labelX: 490,
        labelY: 185,
      },
    ],
    waterBodies: [],
    landmarks: [
      {
        icon: '🏛️',
        name: 'National Museum of Yaoundé',
        x: 450,
        y: 350,
        badge: 'Capital Monument',
      },
      {
        icon: '⛰️',
        name: 'Mount Fébé (Seven Hills)',
        x: 410,
        y: 280,
        badge: 'Seven Hills',
      },
      {
        icon: '🛶',
        name: 'Ebogo Ecotourism & Nyong',
        x: 520,
        y: 520,
        badge: 'Giant Forest Tree',
      },
      {
        icon: '🌳',
        name: 'Mbalmayo Forestry Reserve',
        x: 570,
        y: 440,
        badge: 'Equatorial Canopy',
      },
    ],
    borderAnnotations: {
      top: 'Adamawa Plateau & Sanaga Headwaters',
      right: 'East Region (Great Congo Basin)',
      bottom: 'South Region (Ebolowa & Cocoa Belt)',
      left: 'Littoral & West Regions',
    },
    watermark: {
      french: 'CENTRE',
      english: '(Centre Region • Yaoundé Capital)',
      x: 450,
      y: 420,
    },
    sitePositions: {
      'cen-museum': { x: 460, y: 340 },
      'cen-febe': { x: 400, y: 280 },
      'cen-ebogo': { x: 520, y: 520 },
      'cen-reunification': { x: 440, y: 390 },
      'cen-mbalmayo': { x: 570, y: 440 },
      'cen-sanaga': { x: 560, y: 170 },
    },
  },

  north_west: {
    regionId: 'north_west',
    name: 'North West Region',
    frenchName: 'Région du Nord-Ouest',
    capital: 'Bamenda',
    viewBox: '0 0 900 650',
    landmassPath:
      'M 170,580 C 120,510 110,400 140,310 C 180,210 260,130 360,80 C 460,40 590,50 680,100 C 770,160 820,250 810,360 C 800,460 740,540 660,590 C 570,640 450,640 360,630 C 270,630 200,620 170,580 Z',
    biomeGradient: {
      start: '#34d399', // Grassfields green
      middle: '#10b981', // High volcanic plateau
      end: '#059669', // Mountain mist forest
    },
    topographicLines: [
      'M 220,480 Q 460,400 700,470',
      'M 290,340 Q 480,260 670,330',
      'M 360,220 Q 500,160 640,210',
    ],
    rivers: [
      {
        name: 'Menchum River & Waterfall',
        path: 'M 250,220 Q 380,310 480,420',
        width: 4,
        labelX: 340,
        labelY: 300,
      },
      {
        name: 'Katsina Ala River',
        path: 'M 440,140 Q 570,230 680,330',
        width: 3.5,
        labelX: 580,
        labelY: 260,
      },
    ],
    waterBodies: [
      {
        // Sacred Lake Oku volcanic crater
        path: 'M 590,260 C 620,240 670,250 680,280 C 690,310 650,340 620,340 C 580,330 570,290 590,260 Z',
        fill: '#0284c7',
        stroke: '#ca8a04',
        label: 'Sacred Lake Oku (Crater) 🌊',
        labelX: 630,
        labelY: 240,
      },
    ],
    landmarks: [
      {
        icon: '👑',
        name: "Bafut Fon's Royal Palace",
        x: 410,
        y: 330,
        badge: 'UNESCO Heritage Palace',
      },
      {
        icon: '🌊',
        name: 'Sacred Lake Oku',
        x: 630,
        y: 290,
        badge: 'Crater Lake (2,227m)',
      },
      {
        icon: '💧',
        name: 'Menchum Waterfalls',
        x: 320,
        y: 240,
        badge: 'Torrential Cascade',
      },
      {
        icon: '⛰️',
        name: 'Mankon Highlands (Bamenda)',
        x: 440,
        y: 430,
        badge: 'Ring Road Hub',
      },
    ],
    borderAnnotations: {
      top: 'Nigeria Border (Taraba State Highlands)',
      right: 'Adamawa Plateau & Mbam Valley',
      bottom: 'West Region (Bamiléké Kingdom)',
      left: 'South West Region (Mount Fako Corridor)',
    },
    watermark: {
      french: 'NORD-OUEST',
      english: '(North West Region • Bamenda)',
      x: 450,
      y: 490,
    },
    sitePositions: {
      'nw-bafut': { x: 420, y: 340 },
      'nw-lake-oku': { x: 630, y: 290 },
      'nw-menchum': { x: 310, y: 230 },
      'nw-commercial-ave': { x: 440, y: 440 },
      'nw-ndop': { x: 540, y: 380 },
      'nw-kilum': { x: 680, y: 220 },
    },
  },

  west: {
    regionId: 'west',
    name: 'West Region',
    frenchName: 'Région de l’Ouest',
    capital: 'Bafoussam',
    viewBox: '0 0 900 650',
    landmassPath:
      'M 170,570 C 120,490 120,380 160,280 C 210,180 300,110 400,70 C 510,40 640,50 720,110 C 800,170 830,270 820,370 C 800,470 730,550 640,600 C 540,640 430,640 330,630 C 240,620 190,600 170,570 Z',
    biomeGradient: {
      start: '#10b981',
      middle: '#059669',
      end: '#047857',
    },
    topographicLines: [
      'M 230,470 Q 470,400 710,470',
      'M 300,330 Q 490,260 670,330',
      'M 370,210 Q 510,160 650,210',
    ],
    rivers: [
      {
        name: 'Mbam & Noun River Channels',
        path: 'M 280,180 Q 430,290 560,420 Q 690,520 800,560',
        width: 4.5,
        labelX: 520,
        labelY: 370,
      },
    ],
    waterBodies: [],
    landmarks: [
      {
        icon: '🏰',
        name: 'Foumban Royal Palace (Sultanate)',
        x: 620,
        y: 280,
        badge: 'Bamoun Kingdom',
      },
      {
        icon: '💧',
        name: 'Chutes de la Métché',
        x: 350,
        y: 390,
        badge: 'Sacred Waterfall',
      },
      {
        icon: '👑',
        name: 'Bandjoun Royal Chefferie',
        x: 460,
        y: 430,
        badge: 'Bamiléké Grand Case',
      },
      {
        icon: '🏛️',
        name: 'Dschang Civilisations Museum',
        x: 280,
        y: 310,
        badge: 'Climate Hill Station',
      },
    ],
    borderAnnotations: {
      top: 'North West Grassfields & Ring Road',
      right: 'Centre Region & Mbam Valley',
      bottom: 'Littoral Region & Moungo',
      left: 'South West Region',
    },
    watermark: {
      french: 'OUEST',
      english: '(West Region • Bafoussam)',
      x: 450,
      y: 500,
    },
    sitePositions: {
      'w-foumban': { x: 630, y: 280 },
      'w-metche': { x: 340, y: 390 },
      'w-bandjoun': { x: 460, y: 430 },
      'w-dschang': { x: 270, y: 310 },
      'w-baleng': { x: 430, y: 240 },
      'w-bangangte': { x: 560, y: 470 },
    },
  },

  adamawa: {
    regionId: 'adamawa',
    name: 'Adamawa Region',
    frenchName: 'Région de l’Adamaoua',
    capital: 'Ngaoundéré',
    viewBox: '0 0 900 650',
    landmassPath:
      'M 150,550 C 100,470 110,350 160,250 C 220,150 330,90 450,60 C 570,40 700,60 780,130 C 850,200 870,310 840,410 C 810,500 730,570 630,610 C 510,640 380,640 280,630 C 200,610 160,580 150,550 Z',
    biomeGradient: {
      start: '#86efac', // Savanna plateau
      middle: '#34d399', // Water tower divide
      end: '#10b981', // Volcanic basalt hills
    },
    topographicLines: [
      'M 220,460 Q 470,390 730,460',
      'M 290,320 Q 500,250 700,320',
      'M 370,190 Q 520,150 670,190',
    ],
    rivers: [
      {
        name: 'Vina River (North Divide)',
        path: 'M 440,290 Q 580,210 740,160',
        width: 4,
        labelX: 590,
        labelY: 230,
      },
      {
        name: 'Djérem River (South Basin)',
        path: 'M 440,290 Q 380,410 260,530',
        width: 4,
        labelX: 330,
        labelY: 450,
      },
    ],
    waterBodies: [
      {
        // Lake Tison volcanic maar
        path: 'M 540,320 C 560,305 590,315 595,335 C 600,355 575,370 555,365 C 535,360 525,335 540,320 Z',
        fill: '#0284c7',
        stroke: '#ca8a04',
        label: 'Lake Tison (Crater) 🌊',
        labelX: 565,
        labelY: 300,
      },
    ],
    landmarks: [
      {
        icon: '💧',
        name: 'Chutes de Tello (Basalt Falls)',
        x: 630,
        y: 280,
        badge: 'Water Tower Gorge',
      },
      {
        icon: '🕌',
        name: 'Lamidat de Ngaoundéré',
        x: 470,
        y: 270,
        badge: 'Historic Palace',
      },
      {
        icon: '⛰️',
        name: 'Mount Ngaoundéré',
        x: 420,
        y: 210,
        badge: 'Plateau Peak',
      },
      {
        icon: '🌊',
        name: 'Mbakaou Dam Reservoir',
        x: 320,
        y: 460,
        badge: 'Hydro Reservoir',
      },
    ],
    borderAnnotations: {
      top: 'North Region (Bénoué River Basin)',
      right: 'Central African Republic Border',
      bottom: 'Centre & East Regions (Rainforest)',
      left: 'Nigeria Border (Taraba)',
    },
    watermark: {
      french: 'ADAMAOUA',
      english: '(Adamawa Plateau • Water Tower)',
      x: 450,
      y: 490,
    },
    sitePositions: {
      'ad-tello': { x: 630, y: 280 },
      'ad-lamidat': { x: 470, y: 280 },
      'ad-mount-ng': { x: 420, y: 210 },
      'ad-tison': { x: 560, y: 340 },
      'ad-mbakaou': { x: 310, y: 460 },
      'ad-banyo': { x: 230, y: 320 },
    },
  },

  north: {
    regionId: 'north',
    name: 'North Region',
    frenchName: 'Région du Nord',
    capital: 'Garoua',
    viewBox: '0 0 900 650',
    landmassPath:
      'M 160,560 C 110,480 110,360 160,260 C 220,160 320,90 440,60 C 560,30 690,50 780,110 C 860,180 880,290 850,390 C 820,490 740,560 640,610 C 520,640 390,640 280,630 C 200,610 170,590 160,560 Z',
    biomeGradient: {
      start: '#fde047', // Northern Sahel sun
      middle: '#86efac', // Bénoué river green
      end: '#34d399', // Savanna game reserve
    },
    topographicLines: [
      'M 230,470 Q 470,410 710,480',
      'M 290,330 Q 490,270 680,340',
      'M 360,210 Q 510,160 660,210',
    ],
    rivers: [
      {
        name: 'Bénoué River (Garoua River Port)',
        path: 'M 190,440 Q 360,380 540,310 Q 720,260 830,220',
        width: 6,
        labelX: 470,
        labelY: 360,
      },
    ],
    waterBodies: [
      {
        // Lagdo Dam blue reservoir
        path: 'M 560,310 C 600,280 660,290 710,330 C 740,360 720,410 670,430 C 610,440 570,390 560,350 Z',
        fill: '#0284c7',
        stroke: '#0369a1',
        label: 'Lagdo Blue Reservoir 🌊',
        labelX: 640,
        labelY: 280,
      },
    ],
    landmarks: [
      {
        icon: '🚢',
        name: 'Garoua River Port (Bénoué)',
        x: 420,
        y: 330,
        badge: 'Seasonal Inland Port',
      },
      {
        icon: '🌊',
        name: 'Lagdo Hydroelectric Dam',
        x: 640,
        y: 360,
        badge: 'Clean Energy Reservoir',
      },
      {
        icon: '🪨',
        name: 'Gorges de Kola (Granite Canyon)',
        x: 310,
        y: 250,
        badge: 'Carved Rock Gorge',
      },
      {
        icon: '🦕',
        name: 'Bouba Ndjida (Dinosaur Tracks)',
        x: 690,
        y: 470,
        badge: 'Fossil Reserve',
      },
    ],
    borderAnnotations: {
      top: 'Far North Region (Maroua & Sahel)',
      right: 'Republic of Chad Border',
      bottom: 'Adamawa Region (Ngaoundéré)',
      left: 'Nigeria Border (Yola / Adamawa State)',
    },
    watermark: {
      french: 'NORD',
      english: '(North Region • Garoua River Port)',
      x: 450,
      y: 480,
    },
    sitePositions: {
      'no-garoua-port': { x: 410, y: 340 },
      'no-lagdo': { x: 640, y: 360 },
      'no-kola': { x: 300, y: 250 },
      'no-benoue-park': { x: 480, y: 440 },
      'no-bouba-ndjida': { x: 690, y: 480 },
      'no-rey-bouba': { x: 570, y: 460 },
    },
  },

  far_north: {
    regionId: 'far_north',
    name: 'Far North Region',
    frenchName: 'Région de l’Extrême-Nord',
    capital: 'Maroua',
    viewBox: '0 0 900 650',
    // Authentic northern horn narrowing toward Lake Chad
    landmassPath:
      'M 280,610 C 230,520 220,410 250,300 C 280,200 340,110 410,60 C 470,20 540,20 600,60 C 670,110 720,200 740,300 C 760,400 750,510 690,580 C 620,630 500,640 400,640 C 330,630 290,620 280,610 Z',
    biomeGradient: {
      start: '#fef08a', // Sahel golden sands
      middle: '#fde047', // Acacia savanna
      end: '#86efac', // Southern transition
    },
    topographicLines: [
      'M 310,480 Q 480,420 680,480',
      'M 350,340 Q 500,280 650,340',
      'M 400,220 Q 500,170 600,220',
    ],
    rivers: [
      {
        name: 'Logone River (Chad Border)',
        path: 'M 590,80 Q 640,240 680,420 Q 710,550 720,620',
        width: 4.5,
        labelX: 680,
        labelY: 360,
      },
    ],
    waterBodies: [
      {
        // Lake Chad northern waters
        path: 'M 440,30 Q 500,10 560,30 Q 530,90 470,80 Z',
        fill: '#38bdf8',
        stroke: '#0284c7',
        label: 'Lake Chad Basin 🌊',
        labelX: 500,
        labelY: 55,
      },
    ],
    landmarks: [
      {
        icon: '🐘',
        name: 'Waza National Park',
        x: 480,
        y: 280,
        badge: 'Elephants & Giraffes',
      },
      {
        icon: '🪨',
        name: 'Rhumsiki Kapsiki Peaks',
        x: 320,
        y: 380,
        badge: 'Volcanic Rock Spire',
      },
      {
        icon: '🎨',
        name: 'Maroua Artisan Craft Market',
        x: 520,
        y: 430,
        badge: 'Leather & Brass Guild',
      },
      {
        icon: '🌊',
        name: 'Maga Dam & Fish Lakes',
        x: 620,
        y: 380,
        badge: 'Fisheries Hub',
      },
    ],
    borderAnnotations: {
      top: 'Lake Chad (Nigeria, Niger & Chad Border)',
      right: 'Republic of Chad (N’Djamena / Logone River)',
      bottom: 'North Region (Garoua)',
      left: 'Mandara Mountains & Nigeria Border',
    },
    watermark: {
      french: 'EXTRÊME-NORD',
      english: '(Far North Region • Sahel & Waza)',
      x: 490,
      y: 530,
    },
    sitePositions: {
      'fn-waza': { x: 480, y: 270 },
      'fn-rhumsiki': { x: 310, y: 380 },
      'fn-maroua-market': { x: 520, y: 430 },
      'fn-maga': { x: 630, y: 370 },
      'fn-lake-chad': { x: 490, y: 65 },
      'fn-kousseri': { x: 570, y: 160 },
    },
  },

  east: {
    regionId: 'east',
    name: 'East Region',
    frenchName: 'Région de l’Est',
    capital: 'Bertoua',
    viewBox: '0 0 900 650',
    landmassPath:
      'M 160,560 C 110,480 110,360 160,260 C 220,160 330,80 460,50 C 580,30 710,50 800,120 C 870,190 880,310 850,420 C 810,520 730,590 620,620 C 490,640 370,640 270,620 C 200,600 170,580 160,560 Z',
    biomeGradient: {
      start: '#10b981', // Forest margin
      middle: '#059669', // Dense equatorial canopy
      end: '#047857', // Dja virgin biosphere
    },
    topographicLines: [
      'M 230,470 Q 480,410 730,470',
      'M 300,330 Q 500,270 700,340',
      'M 370,210 Q 520,160 670,210',
    ],
    rivers: [
      {
        name: 'Dja River (UNESCO Loop Moat)',
        path: 'M 240,540 C 210,410 290,320 440,320 C 580,320 630,440 590,560',
        width: 5,
        labelX: 440,
        labelY: 295,
      },
      {
        name: 'Boumba & Sangha Rivers',
        path: 'M 640,240 Q 720,380 770,520',
        width: 4,
        labelX: 740,
        labelY: 390,
      },
    ],
    waterBodies: [],
    landmarks: [
      {
        icon: '🌳',
        name: 'Dja Faunal Reserve (UNESCO)',
        x: 440,
        y: 380,
        badge: 'World Heritage Site',
      },
      {
        icon: '🐘',
        name: 'Lobéké National Park',
        x: 740,
        y: 440,
        badge: 'Forest Elephants',
      },
      {
        icon: '🪵',
        name: 'Bertoua Timber & Gold Guild',
        x: 390,
        y: 220,
        badge: 'Forest Capital',
      },
      {
        icon: '⛺',
        name: 'Baka Pygmy Cultural Forest',
        x: 560,
        y: 460,
        badge: 'Ancient Forest Lore',
      },
    ],
    borderAnnotations: {
      top: 'Adamawa Region (Ngaoundéré Savanna)',
      right: 'Central African Republic & Congo Borders',
      bottom: 'Republic of the Congo (Sangha Tri-National)',
      left: 'Centre & South Regions (Yaoundé Corridor)',
    },
    watermark: {
      french: 'EST',
      english: '(East Rainforest Region • Bertoua)',
      x: 450,
      y: 520,
    },
    sitePositions: {
      'ea-dja': { x: 440, y: 390 },
      'ea-lobeke': { x: 740, y: 440 },
      'ea-bertoua': { x: 380, y: 220 },
      'ea-deng-deng': { x: 320, y: 150 },
      'ea-baka': { x: 560, y: 470 },
      'ea-batouri': { x: 530, y: 230 },
    },
  },

  south: {
    regionId: 'south',
    name: 'South Region',
    frenchName: 'Région du Sud',
    capital: 'Ebolowa',
    viewBox: '0 0 900 650',
    landmassPath:
      'M 170,570 C 110,500 110,380 150,280 C 200,180 300,100 420,60 C 540,30 670,50 760,110 C 840,180 860,290 840,390 C 810,490 740,560 640,610 C 520,640 400,640 300,630 C 220,610 180,590 170,570 Z',
    biomeGradient: {
      start: '#0284c7', // Atlantic Kribi coast
      middle: '#059669', // Dense equatorial jungle
      end: '#047857', // Campo Ma'an coastal forest
    },
    topographicLines: [
      'M 240,480 Q 480,410 720,480',
      'M 310,340 Q 500,270 690,340',
      'M 380,220 Q 520,160 660,210',
    ],
    rivers: [
      {
        name: 'Lobé River & Falls to Atlantic',
        path: 'M 460,340 Q 320,360 200,370',
        width: 5,
        labelX: 330,
        labelY: 340,
      },
      {
        name: 'Ntem River (Southern Border)',
        path: 'M 260,560 Q 440,580 640,540 Q 770,560 840,530',
        width: 4.5,
        labelX: 520,
        labelY: 570,
      },
    ],
    waterBodies: [
      {
        // Atlantic Ocean coastal entrance on West
        path: 'M 0,260 C 70,280 140,330 180,480 L 0,550 Z',
        fill: '#0284c7',
        label: 'Atlantic Ocean (Kribi Coast) 🌊',
        labelX: 80,
        labelY: 390,
      },
    ],
    landmarks: [
      {
        icon: '💧',
        name: 'Chutes de la Lobé (Cascade into Sea)',
        x: 230,
        y: 370,
        badge: 'Water Cascade to Ocean',
      },
      {
        icon: '🏖️',
        name: 'Kribi White Sand Beach & Lighthouse',
        x: 270,
        y: 280,
        badge: 'Coastal Resort',
      },
      {
        icon: '🍫',
        name: 'Ebolowa Master Cocoa Plantations',
        x: 520,
        y: 320,
        badge: 'Golden Pod Region',
      },
      {
        icon: '🦍',
        name: 'Campo Ma’an Coastal Park',
        x: 270,
        y: 490,
        badge: 'Gorilla & Sea Turtle Reserve',
      },
    ],
    borderAnnotations: {
      top: 'Littoral & Centre Regions (Yaoundé & Douala)',
      right: 'East Region (Dja Faunal Reserve)',
      bottom: 'Equatorial Guinea & Gabon Borders (Ntem)',
      left: 'Gulf of Guinea (Atlantic Ocean) 🌊',
    },
    watermark: {
      french: 'SUD',
      english: '(South Region • Ebolowa & Kribi)',
      x: 450,
      y: 460,
    },
    sitePositions: {
      'so-lobe': { x: 240, y: 370 },
      'so-kribi': { x: 270, y: 280 },
      'so-ebolowa': { x: 530, y: 320 },
      'so-campo': { x: 270, y: 490 },
      'so-port': { x: 220, y: 430 },
      'so-sangmelima': { x: 640, y: 290 },
    },
  },
};
