import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const schema = z.object({
  prompt: z.string(),
  modelType: z.enum(["flash", "pro"]),
});

const PROMPT_TEMPLATE =
  "Explain what the selected code does in simple terms under given code context if provided. Assume the audience is a beginner programmer who has just " +
  "learned the language features and basic syntax. The response should be plaintext, no markdown syntax included.";

export async function POST(req: NextRequest) {
  try {
    // Validate request body using zod
    const requestBody = await req.json();
    const response = schema.safeParse(requestBody);

    if (!response.success) {
      const { errors } = response.error;
      return NextResponse.json(
        { error: { message: "Invalid request params", errors } },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    const { prompt: codeSnippet, modelType } = response.data;

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: {
            message: "API key is missing in environment variables",
          },
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    const flashModelId = "models/gemini-1.5-flash";
    const proModelId = "models/gemini-1.5-pro";
    const modelId = modelType === "flash" ? flashModelId : proModelId;

    const fullPrompt = `${PROMPT_TEMPLATE}\n\n${codeSnippet}`;

    const google = createGoogleGenerativeAI({ apiKey });
    const model = google(modelId);

    const { text } = await generateText({ model, prompt: fullPrompt });

    return NextResponse.json(
      { text },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

export async function OPTIONS() {
  // Handle preflight request
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
