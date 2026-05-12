import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { findRegistration } from "@/lib/storage";

type Props = {
  params: Promise<{ referenceCode: string }>;
};

export default async function AdminDetailPage({ params }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { referenceCode } = await params;
  const registration = await findRegistration(referenceCode);
  if (!registration) redirect("/admin");

  return (
    <div className="page">
      <section className="hero">
        <span className="eyebrow">{registration.referenceCode}</span>
        <h1>{registration.name}</h1>
        <p>{registration.ticketType}</p>
      </section>
      <div className="panel">
        <div className="actions" style={{ marginTop: 0, marginBottom: 22 }}>
          <Link className="button secondary" href="/admin">
            Back
          </Link>
          <a className="button" href={`/api/admin/nametag/${registration.referenceCode}`}>
            Download name tag PDF
          </a>
          <a className="button" href={`/api/admin/registrations/${registration.referenceCode}/pdf`}>
            Export registration PDF
          </a>
        </div>
        <div className="detail-list">
          {[
            ["Email", registration.email],
            ["Phone", registration.phone],
            ["Organization", registration.organization],
            ["Job title", registration.jobTitle],
            ["Dietary needs", registration.dietaryNeeds || "-"],
            ["Accessibility needs", registration.accessibilityNeeds || "-"],
            ["Emergency contact", registration.emergencyContact],
            ["Notes", registration.notes || "-"],
          ].map(([label, value]) => (
            <div className="detail-row" key={label}>
              <strong>{label}</strong>
              <span>{value}</span>
            </div>
          ))}
        </div>
        <h2 style={{ marginTop: 28 }}>Documents</h2>
        <div className="documents">
          {registration.documents.length ? (
            registration.documents.map((document) => (
              <div className="document-row" key={document.id}>
                <span>{document.originalName}</span>
                <a href={`/api/documents/${registration.referenceCode}/${document.storedName}`}>
                  Download
                </a>
              </div>
            ))
          ) : (
            <p>No documents uploaded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
