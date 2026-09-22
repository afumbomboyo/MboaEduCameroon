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
    const { question, studentAnswer, correctAnswer, subject, topic, language } = await req.json();

    if (!question || studentAnswer === undefined || !correctAnswer) {
      return NextResponse.json({ error: 'Missing required question details.' }, { status: 400 });
    }

    if (ai) {
      try {
        const langPrompt = language === 'fr' ? 'French' : 'English';
        const prompt = `You are "Tutor Koko", an encouraging, knowledgeable Cameroonian primary school tutor helping a Class 6 (Primary 6) pupil preparing for the Cameroon Common Entrance Examination and FSLC (First School Leaving Certificate).
The student made an error on this question:

Subject: ${subject || 'General'}
Topic: ${topic || 'Core Curriculum'}
Question: "${question}"
Pupil's Selected/Given Answer: "${studentAnswer}"
Correct Answer: "${correctAnswer}"

Analyze the cognitive mistake the child made.
1. Why did the child make this mistake?
2. Provide a warm, encouraging pedagogical step-by-step hint with Cameroon context.
3. Provide a memorable Golden Rule.
4. Generate 2 similar quick follow-up practice drill questions with options A, B, C, D and the correct answer.

Respond ONLY with valid JSON:
{
  "mistakeDiagnosis": "Short 1-sentence diagnostic",
  "stepByStepGuidance": "Encouraging explanation",
  "goldenRule": "Catchy 1-line rule",
  "drillQuestions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "hint": "Short reminder"
    }
  ]
}
Write in ${langPrompt}.`;

        const aiData = await generateWithModelFallback(prompt, 0.3);
        if (aiData && aiData.mistakeDiagnosis && aiData.stepByStepGuidance) {
          return NextResponse.json({ success: true, aiGenerated: true, ...aiData });
        }
      } catch {
        // Fall back below
      }
    }

    return NextResponse.json({
      success: true,
      aiGenerated: false,
      mistakeDiagnosis: `You chose "${studentAnswer}", but the correct answer is "${correctAnswer}".`,
      stepByStepGuidance: `Let's break down why "${correctAnswer}" is correct. Re-read the question keywords carefully and check each option systematically.`,
      goldenRule: 'Examination Secret: Eliminate the two clearly incorrect options first to give yourself a 50/50 advantage.',
      drillQuestions: [
        {
          question: `Review Drill: ${question}`,
          options: [String(correctAnswer), String(studentAnswer), 'None of the above', 'Both A and B'],
          correctIndex: 0,
          hint: `Keep in mind: ${correctAnswer}`,
        },
      ],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
