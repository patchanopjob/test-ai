import AdminLoginForm from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="page">
      <section className="hero">
        <span className="eyebrow">Admin</span>
        <h1>Review event registrations.</h1>
      </section>
      <AdminLoginForm />
    </div>
  );
}
