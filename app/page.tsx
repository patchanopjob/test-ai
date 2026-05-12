import RegistrationForm from "./registration-form";

export default function Home() {
  return (
    <div className="page">
      <section className="hero">
        <span className="eyebrow">Professional Event Registration</span>
        <h1>Register for SummitPass and manage your submission later.</h1>
        <p>
          Submit attendee details, supporting documents, and a password. You will receive a
          reference code for returning to the submission.
        </p>
      </section>
      <RegistrationForm mode="create" />
    </div>
  );
}
