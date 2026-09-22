import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { missionId, studentName, score, totalQuestions, passed } = body;
    const timestamp = new Date().toISOString();
    const bonusXp = passed ? Math.round((Number(score) / Number(totalQuestions)) * 150) : 25;
    const serverValidationId = `val_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: passed
        ? `Server: Mission "${missionId}" validated. Awarded ${bonusXp} bonus XP!`
        : `Server: Attempt logged. Keep striving!`,
      data: {
        bonusXp,
        serverValidationId,
      },
      timestamp,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Invalid request body' }, { status: 400 });
  }
}
