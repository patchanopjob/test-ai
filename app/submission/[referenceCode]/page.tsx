import { redirect } from "next/navigation";
import RegistrationForm from "@/app/registration-form";
import { getSubmissionAuth } from "@/lib/auth";
import { findRegistration, toPublicRegistration } from "@/lib/storage";

type Props = {
  params: Promise<{ referenceCode: string }>;
};

export default async function SubmissionPage({ params }: Props) {
  const { referenceCode } = await params;
  const authCode = await getSubmissionAuth();
  if (authCode !== referenceCode) redirect("/lookup");

  const registration = await findRegistration(referenceCode);
  if (!registration) redirect("/lookup");

  return (
    <div className="page">
      <section className="hero">
        <span className="eyebrow">{registration.referenceCode}</span>
        <h1>Manage your submission.</h1>
        <p>Update attendee information or add new supporting documents.</p>
      </section>
      <RegistrationForm mode="edit" registration={toPublicRegistration(registration)} />
    </div>
  );
}
