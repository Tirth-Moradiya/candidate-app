import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser, { Output } from "pdf2json";
import path from "path";

// interface PDFTextContent {
//   T: string; // Encoded text
// }

// interface PDFText {
//   R: PDFTextContent[]; // Array of text objects
// }

// interface PDFPage {
//   Texts: PDFText[]; // Array of text objects per page
// }

// interface PDFFormImage {
//   Pages: PDFPage[]; // Array of pages
// }

// interface PDFData {
//   formImage?: PDFFormImage; // The formImage contains page data
// }
export async function POST(req: NextRequest) {
  try {
    const formData: FormData = await req.formData();
    const uploadedFiles: FormDataEntryValue[] = formData.getAll("resume"); // ✅ Explicit type
    let fileName = "";
    let parsedText = "";

    if (uploadedFiles.length === 0) {
      console.log("No files found.");
      return new NextResponse(JSON.stringify({ error: "No file found" }), {
        status: 400,
      });
    }

    const uploadedFile: FormDataEntryValue | undefined = uploadedFiles[0];

    if (!uploadedFile || !(uploadedFile instanceof File)) {
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

async function parsePDF(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error("PDF parsing error:", errData.parserError);
      reject(
        new Error(String(errData.parserError || "Unknown PDF parsing error"))
      );
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: Output) => {
      console.log("PDF parsed successfully");

      if (!pdfData?.Pages) {
        console.error("Unexpected PDF structure:", pdfData);
        reject(new Error("Invalid PDF structure"));
        return;
      }

      // Extract text while maintaining the formatting
      const extractedText = pdfData.Pages.map(
        (page) =>
          page.Texts.map((text) =>
            text.R.map((t) => decodeURIComponent(t.T)).join("")
          ).join(" ") // Use space instead of newline to maintain flow
      ).join("\n\n"); // Double newline for paragraph separation

      resolve(extractedText.trim() || "No text found in the document.");
    });

    pdfParser.loadPDF(filePath);
  });
}
