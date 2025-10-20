import mammoth from "mammoth";
import type { Candidate } from "../types";

// CRITICAL FIX: The previous import 'import pdfParse from "pdf-parse";' failed 
// because 'pdf-parse' is a CommonJS module without an explicit 'default' export.
// We use a wildcard import to capture the whole module object.
import * as pdfParseModule from "pdf-parse"; 
// Then, we assert that the entire module object is the function we want to call.
const pdfParse: any = pdfParseModule; 

export interface ResumeParseOptions {
  buffer?: Buffer;
  fileType?: "pdf" | "docx" | "txt";
}

export class ResumeParser {
  // Static method usable by other modules
  static async parseResume(resumeFile: File): Promise<Partial<Candidate>> {
    const parser = new ResumeParser();

    // Convert File to Buffer (This is correct for browser)
    const arrayBuffer = await resumeFile.arrayBuffer();
    // Assuming Buffer polyfill is working via your Vite config
    const buffer = Buffer.from(arrayBuffer); 

    // Detect file type by extension
    const fileType: "pdf" | "docx" | "txt" =
      resumeFile.name.endsWith(".pdf")
        ? "pdf"
        : resumeFile.name.endsWith(".docx")
        ? "docx"
        : "txt";

    // Call instance parse method
    return parser.parse({ buffer, fileType });
  }

  // ---------------- UPDATED instance parse method ----------------
  async parse(options: ResumeParseOptions): Promise<Partial<Candidate>> {
    if (!options.buffer) {
      throw new Error("Buffer must be provided to parse resume");
    }

    const type = options.fileType || "txt";
    let text = "";

    if (type === "pdf") {
      text = await this.parsePDF(options.buffer);
    } else if (type === "docx") {
      text = await this.parseDOCX(options.buffer);
    } else if (type === "txt") {
      text = await this.parseTXT(options.buffer);
    } else {
      throw new Error("Unsupported file type");
    }

    return this.extractCandidateData(text);
  }

  // UPDATED: Only accepts buffer
  private async parsePDF(buffer: Buffer): Promise<string> {
    // We call the module object directly, relying on the 'as any' casting above.
    const parsed = await pdfParse(buffer); 
    return parsed.text;
  }

  // UPDATED: Only accepts buffer
  private async parseDOCX(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer: buffer });
    return result.value;
  }

  // UPDATED: Only accepts buffer
  private async parseTXT(buffer: Buffer): Promise<string> {
    const data = buffer.toString("utf-8"); 
    if (!data) throw new Error("TXT data not provided");

    return data;
  }

  // --- extractCandidateData and extractSkills remain UNCHANGED ---
  private extractCandidateData(text: string): Partial<Candidate> {
    const candidate: Partial<Candidate> = {};

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\d{10}/);
    const nameMatch = text.split("\n")[0];

    if (emailMatch) candidate.email = emailMatch[0];
    if (phoneMatch) candidate.phone = phoneMatch[0];
    if (nameMatch) candidate.name = nameMatch.trim();

    candidate.skills = this.extractSkills(text);

    return candidate;
  }

  private extractSkills(text: string): string[] {
    const skillsList = ["JavaScript", "TypeScript", "Python", "React", "Node", "Java", "C++", "SQL"];
    const found: string[] = [];
    for (const skill of skillsList) {
      const regex = new RegExp(`\\b${skill}\\b`, "i");
      if (regex.test(text)) found.push(skill);
    }
    return found;
  }
}
