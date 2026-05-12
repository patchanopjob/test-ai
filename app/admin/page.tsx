import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { readRegistrations } from "@/lib/storage";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const registrations = await readRegistrations();

  return (
    <div className="page">
      <section className="hero">
        <span className="eyebrow">Admin</span>
        <h1>Registrations</h1>
        <p>{registrations.length} total submission{registrations.length === 1 ? "" : "s"}.</p>
      </section>
      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Name</th>
              <th>Organization</th>
              <th>Ticket</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((registration) => (
              <tr key={registration.referenceCode}>
                <td>
                  <Link href={`/admin/${registration.referenceCode}`}>
                    {registration.referenceCode}
                  </Link>
                </td>
                <td>{registration.name}</td>
                <td>{registration.organization}</td>
                <td>{registration.ticketType}</td>
                <td>{new Date(registration.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
