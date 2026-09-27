import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);
    console.log("Prompt:", prompt);

    const fullPrompt = `
Create a complete playable HTML game.

Requirements:
- Single HTML file
- Include CSS and JavaScript
- Fun gameplay
- Score system
- Win/Lose screen
- Mobile friendly

Game Idea:
${prompt}

Return ONLY raw HTML code.
`;

    console.log("Generating with Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const text = response.text;

    console.log("Gemini Response Received");

    return NextResponse.json({
      success: true,
      code: text,
    });
  } catch (error: any) {
  console.error(error);

  return Response.json(
    {
      success: false,
      error: error.message,
    },
    {
      status: 500,
    }
  );
}
}