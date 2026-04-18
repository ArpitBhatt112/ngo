import { Building2, CheckCircle2, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiPost } from "../lib/api";

const defaultRegister = {
  ngo_name: "",
  government_ngo_id: "",
  owner_name: "",
  owner_id_proof: "",
  contact_number: "",
  email: "",
  password: "",
  city: "",
  mission: ""
};

export default function NgoAuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [registerForm, setRegisterForm] = useState(defaultRegister);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const email = registerForm.email;
      const password = registerForm.password;
      const data = await apiPost("/ngos/register", registerForm);
      setStatus({ type: "success", message: data.message });
      setLoginForm({ email, password });
      setRegisterForm(defaultRegister);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const data = await apiPost("/ngos/login", loginForm);
      login(data);
      navigate("/ngo-dashboard");
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="px-4 pb-16 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6">
          <div className="rounded-[34px] border border-white/70 bg-white/85 p-7 shadow-glow">
            <h1 className="text-3xl font-bold text-ink">Register your NGO</h1>
            <p className="mt-2 text-sm text-ink/65">Add mission, government NGO ID, owner proof, and login credentials.</p>
            <form onSubmit={handleRegister} className="mt-6 grid gap-4 md:grid-cols-2">
              <Input label="NGO name" value={registerForm.ngo_name} onChange={(value) => setRegisterForm((current) => ({ ...current, ngo_name: value }))} placeholder="Hope Basket Foundation" />
              <Input label="Government NGO ID" value={registerForm.government_ngo_id} onChange={(value) => setRegisterForm((current) => ({ ...current, government_ngo_id: value }))} placeholder="NGO-HBF-2026" />
              <Input label="Owner name" value={registerForm.owner_name} onChange={(value) => setRegisterForm((current) => ({ ...current, owner_name: value }))} placeholder="Riya Menon" />
              <Input label="Owner ID proof" value={registerForm.owner_id_proof} onChange={(value) => setRegisterForm((current) => ({ ...current, owner_id_proof: value }))} placeholder="AADHAAR-908712345678" />
              <Input label="Contact number" value={registerForm.contact_number} onChange={(value) => setRegisterForm((current) => ({ ...current, contact_number: value }))} placeholder="9876543210" />
              <Input label="Email" type="email" value={registerForm.email} onChange={(value) => setRegisterForm((current) => ({ ...current, email: value }))} placeholder="ngo@example.org" />
              <Input label="Password" type="password" value={registerForm.password} onChange={(value) => setRegisterForm((current) => ({ ...current, password: value }))} placeholder="Minimum 6 characters" />
              <Input label="City" value={registerForm.city} onChange={(value) => setRegisterForm((current) => ({ ...current, city: value }))} placeholder="Bengaluru" />
              <label className="md:col-span-2 block">
                <span className="mb-2 block text-sm font-semibold text-ink/75">Mission statement</span>
                <textarea
                  required
                  rows="4"
                  value={registerForm.mission}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, mission: event.target.value }))}
                  placeholder="Describe the kind of support your NGO provides."
                  className="w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3 text-ink outline-none transition focus:border-coral"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="md:col-span-2 rounded-2xl bg-ink px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Register NGO"}
              </button>
            </form>
          </div>

          {status.message ? <Notice type={status.type} message={status.message} /> : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-[34px] bg-ink p-8 text-white shadow-glow">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
              <Building2 size={16} />
              NGO Login & Dashboard Access
            </div>
            <h2 className="mt-6 text-4xl font-bold">See donors, donations, and outreach data in one place.</h2>
            <div className="mt-8 space-y-4">
              {[
                "Track every donation mapped to your organization",
                "See donor name, mobile number, city, and ID proof fields",
                "Use dashboard totals to present impact clearly"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[22px] bg-white/10 p-4">
                  <CheckCircle2 className="mt-1 text-moss" size={18} />
                  <p className="text-sm leading-7 text-white/80">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[34px] border border-white/70 bg-white/85 p-7 shadow-glow">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-pine/15 p-3 text-pine">
                <LockKeyhole size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-ink">NGO login</h2>
                <p className="text-sm text-ink/65">Demo NGOs are seeded automatically after backend startup.</p>
              </div>
            </div>
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <Input label="Email" type="email" value={loginForm.email} onChange={(value) => setLoginForm((current) => ({ ...current, email: value }))} placeholder="hopebasket@example.org" />
              <Input label="Password" type="password" value={loginForm.password} onChange={(value) => setLoginForm((current) => ({ ...current, password: value }))} placeholder="ngo12345" />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-coral px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Login to NGO Dashboard
              </button>
            </form>
            <div className="mt-5 rounded-[24px] bg-sand p-4 text-sm text-ink/75">
              Demo credentials after first backend launch: `hopebasket@example.org` / `ngo12345`
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink/75">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3 text-ink outline-none transition focus:border-coral"
      />
    </label>
  );
}

function Notice({ type, message }) {
  return (
    <div
      className={`rounded-[24px] p-4 text-sm font-medium ${
        type === "success" ? "bg-moss text-pine" : "bg-red-50 text-red-700"
      }`}
    >
      {message}
    </div>
  );
}
