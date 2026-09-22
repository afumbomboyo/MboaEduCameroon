import { LocationMission } from '../types';
import { CURRICULUM_QUESTIONS } from './cameroonCurriculum';

const pickQuestion = (questionId: string) => {
  const match = CURRICULUM_QUESTIONS.find((question) => question.id === questionId);
  if (!match) {
    throw new Error(`Missing question definition for ${questionId}`);
  }
  return match;
};

const QUESTION_PALETTES = [
  ['math-02', 'eng-04', 'fr-02', 'gk-01', 'sci-03'],
  ['math-03', 'eng-01', 'fr-01', 'gk-02', 'sci-02'],
  ['math-04', 'eng-03', 'fr-04', 'gk-03', 'sci-01'],
  ['math-05', 'eng-02', 'fr-03', 'gk-04', 'reas-01'],
  ['math-06', 'eng-01', 'fr-02', 'gk-03', 'reas-02'],
  ['math-01', 'eng-04', 'fr-01', 'gk-02', 'sci-04'],
  ['math-02', 'eng-03', 'fr-04', 'gk-01', 'sci-02'],
  ['math-04', 'eng-02', 'fr-03', 'gk-04', 'reas-02'],
  ['math-06', 'eng-03', 'fr-01', 'gk-02', 'sci-03'],
  ['math-05', 'eng-04', 'fr-02', 'gk-03', 'reas-01'],
] as const;

const REGION_BADGE_ICONS: Record<string, string[]> = {
  south_west: ['🌋', '🫖', '🥾', '🏫', '⚽', '🍍', '🏛️', '🌧️', '🌊', '🌿'],
  littoral: ['🚢', '🌉', '🌊', '💰', '🌴', '🧮', '🏛️', '⚡', '⛴️', '📦'],
  centre: ['🏛️', '🏛️', '🖼️', '🐒', '⛰️', '🌊', '📚', '🏛️', '📜', '📖'],
  north_west: ['🧵', '👑', '🌊', '🛡️', '🏛️', '💧', '🛣️', '💰', '🐝', '🗺️'],
  west: ['☕', '👑', '🌿', '💧', '🏛️', '🌋', '🧵', '🧵', '🌱', '🚚'],
  north: ['☀️', '🌾', '🏫', '🚰', '🧺', '🛤️', '🌾', '🧃', '💨', '🛣️'],
  far_north: ['🐘', '🦅', '🛍️', '🏥', '🧭', '🦒', '💧', '🌱', '🚙', '🦌'],
  adamawa: ['🐄', '🥛', '🐂', '💧', '💰', '🛣️', '🌾', '⛈️', '🍽️', '🌿'],
  east: ['🌳', '🪵', '🌿', '🏟️', '📚', '🐘', '🌊', '🍍', '🧭', '🌲'],
  south: ['🍫', '🍫', '🛍️', '🍍', '🏫', '💧', '🌾', '🌉', '🏥', '🐝'],
};

const REGION_MISSION_BLUEPRINTS = {
  south_west: {
    regionName: 'South West Region',
    guideName: 'Mama Ada',
    guideRole: 'Buea Market Wholesaler & Finance Mentor',
    baseCity: 'Buea',
    baseCoordinates: { x: 152, y: 985 },
    missions: [
      'Fako Water Board', 'Tea Cooperative Rescue', 'Mount Fako Trail', 'Buea School Transport', 'Molyko Stadium Drill', 'Pineapple Road Safety', 'Bimbia Heritage Path', 'Debundscha Rain Lab', 'Limbe Coastal Watch', 'Tole Tea Estate'],
  },
  littoral: {
    regionName: 'Littoral Region',
    guideName: 'Mami Ngo',
    guideRole: 'President of Douala Market Traders',
    baseCity: 'Douala',
    baseCoordinates: { x: 185, y: 1005 },
    missions: [
      'Port Cargo Ledger', 'Bonabéri Bridge Safety', 'Wouri River Cleanup', 'New Bell Budget Repair', 'Cocoa Export Audit', 'Akwa Market Counting', 'Maritime Museum Tour', 'Sanaga Hydropower Check', 'Yassa Ferry Service', 'Logistics Route Match'],
  },
  centre: {
    regionName: 'Centre Region',
    guideName: 'Mballa',
    guideRole: 'Civic Education Inspector & National Historian',
    baseCity: 'Yaoundé',
    baseCoordinates: { x: 370, y: 1018 },
    missions: [
      'Seven Hills Civic Quiz', 'National Assembly Debate', 'Museum Heritage Guide', 'Mefou Primate Patrol', 'Mont Fébé Viewpoint', 'Nyong River Survey', 'School Garden Audit', 'Parliament Budget Check', 'Government Symbols Match', 'Civic Reading Review'],
  },
  north_west: {
    regionName: 'North West Region',
    guideName: 'Bih Lum',
    guideRole: 'Master Toghu Artisan & Grassfields Heritage Custodian',
    baseCity: 'Bamenda',
    baseCoordinates: { x: 221, y: 790 },
    missions: [
      'Toghu Pattern Geometry', 'Bafut Royal Festival', 'Lake Oku Weather Watch', 'Sabga Pass Safety', 'Mankon Heritage Museum', 'Menchum Waterfall Trial', 'Bamenda Ring Road Review', 'Bafut Market Pricing', 'Oku Honey Harvest', 'Grassfield Road Mapping'],
  },
  west: {
    regionName: 'West Region',
    guideName: 'Fo Kenne',
    guideRole: 'Highland Agricultural Leader & Royal Council Elder',
    baseCity: 'Bafoussam',
    baseCoordinates: { x: 252, y: 845 },
    missions: [
      'Coffee Terrace Perimeter', 'Foumban Palace Story', 'Bandjoun Bamboo Survey', 'Métché Falls Safety', 'Dschang Museum Quest', 'Mbapit Crater Check', 'Baham Royal Workshop', 'Khadi Fabric Trade', 'Bafoussam Nursery Care', 'Mbouda Transport Route'],
  },
  north: {
    regionName: 'North Region',
    guideName: 'Dr. Amina',
    guideRole: 'Northern Clean Energy Specialist',
    baseCity: 'Garoua',
    baseCoordinates: { x: 570, y: 440 },
    missions: [
      'Bénoué Solar Pump', 'Cotton Field Ledger', 'Garoua School Energy', 'Riverbank Flood Watch', 'Market Stall Count', 'Pastoral Water Route', 'Béka Millet Survey', 'Pito Trade Check', 'Sahel Wind Study', 'Roadside Cholera Alert'],
  },
  far_north: {
    regionName: 'Far North Region',
    guideName: 'Ranger Oumarou',
    guideRole: 'Waza Chief Park Warden',
    baseCity: 'Maroua',
    baseCoordinates: { x: 670, y: 300 },
    missions: [
      'Waza Waterhole Watch', 'Sahel Bird Count', 'Maroua Market Prices', 'Mora Health Route', 'Dried River Survey', 'Giraffe Protection Patrol', 'School Water Cart', 'Acacia Nursery Check', 'Desert Road Safety', 'Wildlife Track Reading'],
  },
  adamawa: {
    regionName: 'Adamawa Region',
    guideName: 'Ardo Bello',
    guideRole: 'High Plateau Cattle Rancher',
    baseCity: 'Ngaoundéré',
    baseCoordinates: { x: 590, y: 647 },
    missions: [
      'Plateau Dairy Route', 'Milk Collection Count', 'Lapair Cattle Check', 'Leke Water Tower', 'Ngaoundéré Market Ledger', 'Road Safety Patrol', 'Pasture Rotation Plan', 'Highland Storm Watch', 'School Nutrition Audit', 'Mbandjock Ginger Review'],
  },
  east: {
    regionName: 'East Region',
    guideName: 'Ekotto Jean',
    guideRole: 'Rainforest Botanist & Conservator',
    baseCity: 'Bertoua',
    baseCoordinates: { x: 600, y: 944 },
    missions: [
      'Dja Forest Watch', 'Timber Ledger Review', 'Canopy Rain Study', 'Sport Field Cleanup', 'Bertoua School Supply', 'Elephant Track Patrol', 'River Crossing Safety', 'Forest Fruit Survey', 'Forest Ranger Drill', 'Camwood Tree Count'],
  },
  south: {
    regionName: 'South Region',
    guideName: 'Papa Ze',
    guideRole: 'Master Cocoa Planter',
    baseCity: 'Ebolowa',
    baseCoordinates: { x: 332, y: 1125 },
    missions: [
      'Cocoa Pod Count', 'Fermentation Quality Check', 'Ebolowa Market Trade', 'Forest Fruit Packing', 'School Cocoa Budget', 'Village Water Survey', 'Cacao Drying Rate', 'Bridge Safety Patrol', 'Health Center Supply', 'Beehive Trail Check'],
  },
} as const;

const createExpandedMissionSet = (
  regionKey: keyof typeof REGION_MISSION_BLUEPRINTS,
  paletteOffset: number
) => {
  const config = REGION_MISSION_BLUEPRINTS[regionKey];

  return config.missions.map((missionName, index) => {
    const questionIds = QUESTION_PALETTES[(paletteOffset + index) % QUESTION_PALETTES.length];
    const missionNumber = String(index + 1).padStart(2, '0');
    const missionId = `mission-${regionKey}-${missionNumber}`;
    const title = missionName.startsWith('Mission:') ? missionName : `Mission: ${missionName}`;
    const badgeIcon = REGION_BADGE_ICONS[regionKey]?.[index % REGION_BADGE_ICONS[regionKey].length] ?? '📍';

    return {
      id: missionId,
      city: config.baseCity,
      region: regionKey,
      regionName: config.regionName,
      title,
      tagline: `Solve the local challenge in ${config.baseCity} and strengthen the community with careful thinking.`,
      guideName: config.guideName,
      guideRole: config.guideRole,
      storyIntro: `People in ${config.baseCity} need quick thinking and smart teamwork. ${title} has started, and the community is counting on you to solve the plan before the next market day.`,
      storyOutro: `Excellent work! ${config.baseCity} is safer, calmer, and better prepared because of your careful answers and teamwork.`,
      badgeId: `badge-${regionKey}-${missionNumber}`,
      badgeName: `${config.regionName.split(' Region')[0]} Champion ${missionNumber}`,
      badgeIcon,
      toolReward: 'Regional Challenge Kit',
      coinsReward: 140 + (index * 12),
      xpReward: 280 + (index * 18),
      coordinates: {
        x: config.baseCoordinates.x + ((index % 5) * 14),
        y: config.baseCoordinates.y + (Math.floor(index / 5) * 16),
      },
      questions: questionIds.map((questionId) => pickQuestion(questionId)),
    } satisfies LocationMission;
  });
};

export const CAMEROON_MISSIONS: LocationMission[] = Object.entries(
  REGION_MISSION_BLUEPRINTS
).flatMap(([regionKey, config], regionIndex) =>
  createExpandedMissionSet(
    regionKey as keyof typeof REGION_MISSION_BLUEPRINTS,
    regionIndex + 1
  )
);
