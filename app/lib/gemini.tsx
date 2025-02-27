import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getGeminiEmbedding(text: string): Promise<number[]> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "embedding-001" });

    const result = await model.embedContent({
      content: {
        role: "user",
        parts: [{ text }],
      },
    });

    return result.embedding?.values || [];
  } catch (error) {
    console.error("Gemini Embedding Error:", error);
    return [];
  }
}
