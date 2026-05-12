import type { Registration } from "./types";

function escapePdf(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createPdf(lines: string[], width: number, height: number) {
  const content = lines.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
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

export function createNameTagPdf(registration: Registration) {
  const lines = [
    "BT /F1 18 Tf 50 245 Td (SummitPass 2026) Tj ET",
    `BT /F1 34 Tf 50 185 Td (${escapePdf(registration.name)}) Tj ET`,
    `BT /F1 16 Tf 50 150 Td (${escapePdf(registration.jobTitle)}) Tj ET`,
    `BT /F1 16 Tf 50 126 Td (${escapePdf(registration.organization)}) Tj ET`,
    `BT /F1 12 Tf 50 72 Td (Reference: ${escapePdf(registration.referenceCode)}) Tj ET`,
  ];

  return createPdf(lines, 420, 300);
}

function detailLine(label: string, value: string, y: number) {
  return `BT /F1 11 Tf 50 ${y} Td (${escapePdf(label)}) Tj ET\nBT /F2 11 Tf 190 ${y} Td (${escapePdf(value || "-")}) Tj ET`;
}

export function createRegistrationDetailsPdf(registration: Registration) {
  const fields: Array<[string, string]> = [
    ["Reference code", registration.referenceCode],
    ["Name", registration.name],
    ["Email", registration.email],
    ["Phone", registration.phone],
    ["Organization", registration.organization],
    ["Job title", registration.jobTitle],
    ["Ticket type", registration.ticketType],
    ["Dietary needs", registration.dietaryNeeds],
    ["Accessibility needs", registration.accessibilityNeeds],
    ["Emergency contact", registration.emergencyContact],
    ["Notes", registration.notes],
    ["Documents", registration.documents.map((document) => document.originalName).join(", ")],
    ["Submitted at", new Date(registration.createdAt).toLocaleString("en-US")],
    ["Updated at", new Date(registration.updatedAt).toLocaleString("en-US")],
  ];

  const lines = [
    "BT /F1 20 Tf 50 780 Td (Registration Details) Tj ET",
    "BT /F2 11 Tf 50 758 Td (SummitPass admin export) Tj ET",
    ...fields.map(([label, value], index) => detailLine(label, value.slice(0, 70), 720 - index * 30)),
  ];

  return createPdf(lines, 595, 842);
}
