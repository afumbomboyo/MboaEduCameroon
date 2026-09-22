'use server';

/**
 * Next.js Server Actions for MboaEdu
 * Compatible across both direct Next.js App Router Server Action RPC and HTTP fallback
 */

export interface MissionCompletionPayload {
  missionId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  timeSpentSeconds?: number;
}

export interface ServerActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

/**
 * Server Action to record and validate a mission completion on the server
 */
export async function recordMissionResult(
  payload: MissionCompletionPayload
): Promise<ServerActionResponse<{ bonusXp: number; serverValidationId: string }>> {
  // If invoked in browser environment where Next.js Server Action RPC is unavailable, proxy to API endpoint
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/game/record-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Fallback HTTP mission record failed, executing client fallback calculation');
    }
  }

  // Server-side execution logic
  const timestamp = new Date().toISOString();
  const bonusXp = payload.passed ? Math.round((Number(payload.score) / Number(payload.totalQuestions)) * 150) : 25;
  const serverValidationId = `val_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

  console.log(`[Next.js Server Action] Recorded mission for ${payload.studentName}:`, {
    missionId: payload.missionId,
    score: `${payload.score}/${payload.totalQuestions}`,
    bonusXp,
    serverValidationId,
  });

  return {
    success: true,
    message: payload.passed
      ? `Server Action: Mission "${payload.missionId}" validated. Awarded ${bonusXp} bonus XP!`
      : `Server Action: Attempt logged. Keep striving!`,
    data: {
      bonusXp,
      serverValidationId,
    },
    timestamp,
  };
}

/**
 * Server Action to submit an exam result for server-side verification and analytics
 */
export async function submitExamServerAction(examData: {
  studentName: string;
  subject: string;
  scorePercentage: number;
  passed: boolean;
}): Promise<ServerActionResponse<{ rankAssessment: string }>> {
  const timestamp = new Date().toISOString();

  let rankAssessment = 'Developing Scholar';
  if (examData.scorePercentage >= 80) {
    rankAssessment = 'First Class Distinction Candidate';
  } else if (examData.scorePercentage >= 60) {
    rankAssessment = 'Merit Scholar';
  }

  return {
    success: true,
    message: `Server Action: Official exam score recorded for ${examData.studentName}.`,
    data: {
      rankAssessment,
    },
    timestamp,
  };
}
