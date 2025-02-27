import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData: FormData = await req.formData();
    const uploadedFiles = formData.getAll("resume"); // Match frontend key name
    let fileName = "";
    let parsedText = "";

    if (uploadedFiles.length === 0) {
      console.log("No files found.");
      return new NextResponse(JSON.stringify({ error: "No file found" }), {
        status: 400,
      });
    }

    const uploadedFile = uploadedFiles[0];
    console.log("Uploaded file:", uploadedFile);

    if (!(uploadedFile instanceof File)) {
      console.log("Uploaded file is not in the expected format.");
      return new NextResponse(
        JSON.stringify({ error: "Invalid file format" }),
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    fileName = `${uuidv4()}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

    // Save the buffer as a file
    await fs.writeFile(filePath, fileBuffer);

    // Parse PDF
    parsedText = await parsePDF(filePath);

    if (!parsedText) {
      console.log("No text extracted.");
      return new NextResponse(
        JSON.stringify({ error: "No text extracted from resume" }),
        { status: 500 }
      );
    }

    return new NextResponse(
      JSON.stringify({ text: parsedText, filePath: `/uploads/${fileName}` }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}

// ✅ Ensures the parser completes before proceeding
async function parsePDF(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      console.error("PDF parsing error:", errData.parserError);
      reject(errData.parserError);
    });

    pdfParser.on("pdfParser_dataReady", () => {
      console.log("PDF parsed successfully");
      resolve((pdfParser as any).getRawTextContent());
    });

    pdfParser.loadPDF(filePath);
  });
}
