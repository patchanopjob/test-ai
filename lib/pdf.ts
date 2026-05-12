import type { Registration } from "./types";

function escapePdf(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function createNameTagPdf(registration: Registration) {
  const lines = [
    "BT /F1 18 Tf 50 245 Td (SummitPass 2026) Tj ET",
    `BT /F1 34 Tf 50 185 Td (${escapePdf(registration.name)}) Tj ET`,
    `BT /F1 16 Tf 50 150 Td (${escapePdf(registration.jobTitle)}) Tj ET`,
    `BT /F1 16 Tf 50 126 Td (${escapePdf(registration.organization)}) Tj ET`,
    `BT /F1 12 Tf 50 72 Td (Reference: ${escapePdf(registration.referenceCode)}) Tj ET`,
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 420 300] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${Buffer.byteLength(lines)} >>\nstream\n${lines}\nendstream`,
  ];

  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) {
    body += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(body);
}
