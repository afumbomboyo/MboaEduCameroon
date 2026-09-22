export type SubjectId =
  | 'mathematics'
  | 'english'
  | 'french'
  | 'science'
  | 'general_knowledge'
  | 'reasoning';

export type RegionId =
  | 'south_west'
  | 'littoral'
  | 'centre'
  | 'north_west'
  | 'west'
  | 'north'
  | 'far_north'
  | 'adamawa'
  | 'east'
  | 'south';

export interface QuestionItem {
  id: string;
  subject: SubjectId;
  subjectLabel: string;
  topic: string;
  prompt: string;
  contextText?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  paperType: 'common_entrance' | 'fslc' | 'both';
  points: number;
}

export interface LocationMission {
  id: string;
  city: string;
  region: RegionId;
  regionName: string;
  title: string;
  tagline: string;
  guideName: string;
  guideRole: string;
  storyIntro: string;
  storyOutro: string;
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
  toolReward: string;
  coinsReward: number;
  xpReward: number;
  coordinates: { x: number; y: number }; // percentage on Cameroon map
  questions: QuestionItem[];
}

export interface PupilProfile {
  id?: string;
  name: string;
  schoolName: string;
  gradeClass: string;
  avatarColor?: string;
  avatarOutfit?: string;
  activeTitle?: string;
  uniformStyle?: 'khaki' | 'navy' | 'toghu' | 'kaba';
  accessory?: 'glasses' | 'cap' | 'tie' | 'badge';
  coins: number;
  xp: number;
  level: number;
  completedMissionIds: string[];
  unlockedBadges: string[];
  unlockedTools: string[];
  streakDays: number;
  lastActiveDate?: string;
  errorHistory: MistakeRecord[];
}

export interface MistakeRecord {
  id: string;
  timestamp: number;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  subject: SubjectId;
  topic: string;
  diagnosis?: string;
}

export interface ExamQuestionAnswer {
  questionId: string;
  selectedOptionIndex: number | null;
  isFlagged: boolean;
}

export interface ExamResult {
  id: string;
  examTitle: string;
  date: string;
  overallPercentage: number;
  totalQuestions: number;
  correctAnswersCount: number;
  timeSpentSeconds: number;
  subjectScores: {
    subject: SubjectId;
    label: string;
    total: number;
    correct: number;
    percentage: number;
  }[];
  weakTopics: string[];
  strongTopics: string[];
  aiDiagnosis?: {
    readinessTier: string;
    summary: string;
    strengths: string[];
    weaknesses: { topic: string; cause: string; action: string }[];
    weeklyPlan: string[];
  };
}

export interface StudentProgressItem {
  id: string;
  name: string;
  avatarUniform: string;
  overallScore: number;
  examReadiness: number;
  timeSpentMinutes: number;
  attendanceDays: number;
  weakestTopic: string;
  strongestSubject: string;
}

export interface SchoolLeagueEntry {
  rank: number;
  schoolName: string;
  city: string;
  region: string;
  zone: string;
  score: number;
  activePupils: number;
  trophy: 'gold' | 'silver' | 'bronze' | 'participant';
}
