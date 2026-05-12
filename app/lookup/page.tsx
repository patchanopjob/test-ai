import LookupForm from "./lookup-form";

export default function LookupPage() {
  return (
    <div className="page">
      <section className="hero">
        <span className="eyebrow">Submission lookup</span>
        <h1>Return to your registration.</h1>
        <p>Use your reference code and password to view or edit your submitted details.</p>
      </section>
      <LookupForm />
    </div>
  );
}
