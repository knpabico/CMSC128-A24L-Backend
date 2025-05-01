import { verifyAuth } from "@/lib/firebase/auth-utils";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const authResult = await verifyAuth(req);

  if (!authResult.authenticated) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const { data } = await req.json();
  const groq = new Groq({
    apiKey: "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",
  });

  try {
    const newSummary = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a renowned expert in writing concise and easy to understand report summary for a given set of data from an Alumni Management System of University of the Philippines Los Banos.",
        },
        {
          role: "user",
          content: `Using the following data, turn it into an insight and please provide a report summary.
           Data: ${data}
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
