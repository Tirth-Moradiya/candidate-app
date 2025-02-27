import { NextRequest, NextResponse } from "next/server";
import pinecone from "@/app/lib/pinecone";
import { getGeminiEmbedding } from "@/app/lib/gemini"; // ✅ Corrected function

export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get("content-type")?.includes("application/json")) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid content type. Use application/json" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    console.log("✅ Parsed JSON Body:", body);

    const { name, email, linkedin, skills, experience } = body;
    if (!name || !email) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields: name, email" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Use correct Gemini embedding model
    const textForEmbedding = `Skills: ${skills} Experience: ${experience}`;
    const vector = await getGeminiEmbedding(textForEmbedding);

    if (!vector || vector.length !== 768) {
      // ✅ Gemini embeddings are 768-dimensional
      return new NextResponse(
        JSON.stringify({ error: "Failed to generate correct embeddings" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const pineconeIndexName = process.env.PINECONE_INDEX;
    if (!pineconeIndexName) {
      return new NextResponse(
        JSON.stringify({ error: "Pinecone index name is missing in .env" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const pineconeIndex = pinecone.Index(pineconeIndexName);
    await pineconeIndex.upsert([
      {
        id: email,
        values: vector, // ✅ Now using correct Gemini 768-dimension vectors
        metadata: { name, email, linkedin, skills, experience },
      },
    ]);

    console.log("✅ Candidate stored successfully");

    return new NextResponse(
      JSON.stringify({ message: "Candidate stored successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error storing candidate:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
