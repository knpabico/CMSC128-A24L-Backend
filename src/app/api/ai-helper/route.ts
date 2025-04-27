import { verifyAuth } from "@/lib/firebase/auth-utils";
import { AIQuestion } from "@/models/models";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  interface QuestionRequest {
    question: AIQuestion;
    type: string;
  }

  const authResult = await verifyAuth(req);

  if (!authResult.authenticated) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const { question, type } = (await req.json()) as QuestionRequest;
  const groq = new Groq({
    apiKey: "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",
  });

  try {
    const newSummary = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a renowned expert in writing concise details for announcements, events, job postings, donation drives, sponsorships, and scholarships given only the available details. ",
        },
        {
          role: "user",
          content: `Using the following details from a/an ${type} type, please provide a ${type} description (only description and not a title). If some of the details are not provided, still create a description based on the available details.
            What: ${question.what}
            Who: ${question.who}
            When: ${question.when}
            Where: ${question.where}
            
          `,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });
    const summary = newSummary.choices[0]?.message.content;
    return NextResponse.json({
      answer: summary,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Error processing request", { status: 500 });
  }
}
