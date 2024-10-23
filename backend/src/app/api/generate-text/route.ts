import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const schema = z.object({
  prompt: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const response = schema.safeParse(requestBody);
    if (!response.success) {
      const { errors } = response.error;
      return NextResponse.json(
        { error: { message: "Invalid request params", errors } },
        { status: 400 }
      );
    }

    const { prompt } = response.data;

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const modelId = process.env.GOOGLE_MODEL_ID;

    if (!apiKey || !modelId) {
      return NextResponse.json(
        {
          error: {
            message: "API key or model ID is missing in environment variables",
          },
        },
        { status: 500 }
      );
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const model = google(`models/${modelId}`, { topK: 1 });

    const { text } = await generateText({ model, prompt });

    return NextResponse.json({ text }, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
