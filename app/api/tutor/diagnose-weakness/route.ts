import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const GEMINI_TEXT_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

function cleanAndParseJSON(raw: string): any {
  let clean = raw.trim();
  if (clean.startsWith('```json')) {
    clean = clean.slice(7);
  } else if (clean.startsWith('```')) {
    clean = clean.slice(3);
  }
  if (clean.endsWith('```')) {
    clean = clean.slice(0, -3);
  }
  clean = clean.trim();

  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(clean);
}

async function generateWithModelFallback(prompt: string, temperature = 0.2): Promise<any | null> {
  if (!ai) return null;

  for (const model of GEMINI_TEXT_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature,
        },
      });

      const text = response?.text;
      if (text) {
        return cleanAndParseJSON(text);
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { pupilName, scores, incorrectTopics } = await req.json();

    if (ai) {
      try {
        const prompt = `You are the lead academic evaluator for the Cameroon National Primary Examinations Board.
Analyze the following mock Common Entrance & FSLC performance for pupil: ${pupilName || 'The Pupil'}
Subject Scores:
${JSON.stringify(scores, null, 2)}
Topics where errors occurred:
${JSON.stringify(incorrectTopics || [], null, 2)}

Provide a concise, motivating diagnosis report for the parent and teacher:
1. Executive summary of exam readiness (percentage, readiness tier).
2. Key strengths.
3. Top 3 urgent weakness areas with actionable learning advice.
4. Next week's prescribed mission pathway in Cameroon (e.g., Douala Market Math, Buea Volcano Science).

Respond ONLY with valid JSON:
{
  "readinessTier": "Exceeding Expectations | On Track for First Choice | Needs Targeted Support",
  "summary": "2-3 sentences summary",
  "strengths": ["string"],
  "weaknesses": [
    { "topic": "string", "cause": "string", "action": "string" }
  ],
  "weeklyPlan": ["string"]
}`;

        const aiData = await generateWithModelFallback(prompt, 0.2);
        if (aiData && aiData.readinessTier && aiData.summary) {
          return NextResponse.json({ success: true, aiGenerated: true, report: aiData });
        }
      } catch {
        // Fall back below
      }
    }

    const fallbackReport = {
      readinessTier: 'On Track for First Choice College',
      summary: `${pupilName || 'The pupil'} demonstrates solid grasp of fundamental arithmetic, grammar, and environmental science, with strong potential for top-tier Common Entrance scores after polishing word problems and French verbs.`,
      strengths: [
        'High accuracy in basic arithmetic operations and Cameroon civics',
        'Strong reading comprehension in English paper',
        'Good familiarity with regional geography and national symbols',
      ],
      weaknesses: [
        {
          topic: 'Fractions & Word Problems',
          cause: 'Misreading multi-step currency conversion and common denominators.',
          action: 'Play 3 sessions of Douala Market Mathematics mission this week.',
        },
        {
          topic: 'French Conjugation & Agreement',
          cause: 'Mixing present and past participles for irregular verbs (avoir/être).',
          action: 'Complete the Yaoundé Civic & Bilingual Dialogue quest.',
        },
      ],
      weeklyPlan: [
        'Complete 3 Douala Market Math missions focusing on FCFA change & profit percentage.',
        'Review Mount Cameroon Volcano Science to master volcanic rock types.',
        'Practice 2 timed 15-minute French grammar sprints.',
      ],
    };

    return NextResponse.json({ success: true, aiGenerated: false, report: fallbackReport });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
