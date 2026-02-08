import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { vibe, social, time, duration, aloneOk } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const now = new Date();
    const currentTime = now.toLocaleTimeString();
    const currentDate = now.toLocaleDateString();

    const prompt = `You are an assistant for a social app called Vamos that helps people find spontaneous activities.

Search for 3 real, specific venues or public spaces that fit a "${vibe}" vibe.
Social context: ${social}.
Time preference: ${time}.
Intended duration: ${duration}.
Is it okay to go alone? ${aloneOk}.
Current time: ${currentTime}, ${currentDate}.

IMPORTANT: Suggest REAL types of locations (cafes, parks, bars, galleries, etc.) with realistic names and descriptions. Include approximate lat/lng coordinates.

Respond with ONLY a JSON array, no markdown, no backticks. Each object must have:
- activity (string): name of the place/activity
- reason (string): why it fits the vibe
- vibe (string): one of cozy, curious, fun, chill, spontaneous
- details (string): what to expect
- lat (number): approximate latitude
- lng (number): approximate longitude`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean and parse the response
    const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
    let suggestions;
    try {
      suggestions = JSON.parse(cleaned);
    } catch {
      suggestions = [];
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Gemini inspire error:", error);
    return NextResponse.json(
      { error: "Failed to get suggestions", suggestions: [] },
      { status: 500 }
    );
  }
}
