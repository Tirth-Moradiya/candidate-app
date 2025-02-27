import { NextRequest, NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

const auth = new GoogleAuth({
  keyFile: "./google-key.json",
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

export async function POST(req: NextRequest) {
  const { resumeText, jobDescription } = await req.json();
  const client = await auth.getClient();

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateText",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${await client.getAccessToken()}` },
      body: JSON.stringify({
        prompt: `Analyze this resume:\n${resumeText}\nJob Description:\n${jobDescription}`,
      }),
    }
  );

  const data = await res.json();
  return NextResponse.json({ summary: data.candidates[0].output });
}
