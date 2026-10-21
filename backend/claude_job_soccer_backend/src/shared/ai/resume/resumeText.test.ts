import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import "../../../config";
import { cleanResumeText, extractPdfText } from "./resumeText";

/** Minimal one-page PDF with the given lines (Helvetica). */
const makePdf = (lines: string[]): Buffer => {
  const content = lines.map((l, i) => `BT /F1 11 Tf 50 ${760 - i * 18} Td (${l.replace(/[()]/g, "")}) Tj ET`).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
};

describe("resume text", () => {
  it("reads the text of a PDF resume", async () => {
    const file = path.join(os.tmpdir(), `cv-${Date.now()}.pdf`);
    const lines = Array.from({ length: 8 }, (_, i) => `Line ${i + 1}: scouting experience, UEFA C licence, report writing.`);
    fs.writeFileSync(file, makePdf(lines));
    const result = await extractPdfText(file);
    expect(result.status).toBe("ok");
    expect(result.pages).toBe(1);
    expect(result.text).toContain("UEFA C licence");
    fs.rmSync(file, { force: true });
  });

  it("flags PDFs without a text layer", async () => {
    const file = path.join(os.tmpdir(), `scan-${Date.now()}.pdf`);
    fs.writeFileSync(file, makePdf(["x"]));
    expect((await extractPdfText(file)).status).toBe("no_text_layer");
    fs.rmSync(file, { force: true });
  });

  it("normalises whitespace and caps length", () => {
    expect(cleanResumeText("a  \t b\n\n\n\nc")).toBe("a b\n\nc");
    expect(cleanResumeText("x".repeat(30_000))).toHaveLength(20_000);
  });
});
