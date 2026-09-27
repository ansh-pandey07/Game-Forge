import { NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const fullPrompt = `
You are an expert HTML5 game developer.

Create a COMPLETE playable game.

Rules:
- Return ONLY HTML code.
- Use HTML, CSS and JavaScript.
- Put CSS inside <style>.
- Put JS inside <script>.
- No explanations.
- No markdown.
- No \`\`\`html.
- Must be playable.
- Show score.
- Arrow keys should work.
- Mobile friendly.

Game Request:
${prompt}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const code = response.text || "";

    return NextResponse.json({
      success: true,
      code,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate game",
      },
      { status: 500 }
    );
  }
}
console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);
console.log(
  "API KEY START:",
  process.env.GEMINI_API_KEY?.slice(0, 8)
);