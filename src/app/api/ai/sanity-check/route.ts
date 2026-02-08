import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { title, location, date, time } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `You are a friendly assistant for a social app called Vamos. 
    
Someone is planning this event:
- Title: ${title}
- Location: ${location}
- Time: ${time} on ${date}

Give a brief, friendly vibe check:
1. Is this a real, reasonable place and time?
2. Any tips (busy hours, weather considerations, parking, etc.)?
3. Keep it casual and "no-pressure" — this is a spontaneous hangout app.

Be concise (2-3 short paragraphs max). Use a warm, encouraging tone. If something seems off, gently mention it.`;

    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Gemini sanity check error:", error);
    return NextResponse.json(
      { error: "Failed to check plan", feedback: null },
      { status: 500 }
    );
  }
}
