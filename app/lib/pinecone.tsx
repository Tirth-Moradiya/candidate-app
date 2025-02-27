import { Pinecone } from "@pinecone-database/pinecone";
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const index = pinecone.index("candidates");
console.log(index);

export default pinecone;
