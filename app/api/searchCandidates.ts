import { NextRequest, NextResponse } from "next/server";
import { pinecone } from "@/app/lib/pinecone";
import { getEmbeddings } from "@/app/lib/embeddings";

export async function POST(req: NextRequest) {
  const { jobDescription } = await req.json();
  const jobVector = await getEmbeddings(jobDescription);

  const index = pinecone.index("candidates");
  const searchResults = await index.query({ vector: jobVector, topK: 5 });

  return NextResponse.json({ results: searchResults.matches });
}
