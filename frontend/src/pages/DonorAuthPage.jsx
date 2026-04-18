import { CheckCircle2, KeyRound, Smartphone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiPost } from "../lib/api";

const defaultRegister = {
  name: "",
  mobile_number: "",
  id_proof: "",
  city: ""
};

export default function DonorAuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [registerForm, setRegisterForm] = useState(defaultRegister);
  const [loginForm, setLoginForm] = useState({ mobile_number: "", otp_code: "" });
  const [demoOtp, setDemoOtp] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const mobileNumber = registerForm.mobile_number;
      const data = await apiPost("/donors/register", registerForm);
      setStatus({ type: "success", message: data.message });
      setRegisterForm(defaultRegister);
      setLoginForm((current) => ({ ...current, mobile_number: mobileNumber }));
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const data = await apiPost("/donors/request-otp", { mobile_number: loginForm.mobile_number });
      setDemoOtp(data.demo_otp);
      setRequestSent(true);
      setStatus({ type: "success", message: data.message });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const data = await apiPost("/donors/verify-otp", loginForm);
      login(data);
      navigate("/donor-dashboard");
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="px-4 pb-16 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-8 py-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[34px] bg-ink p-8 text-white shadow-glow">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
            <Smartphone size={16} />
            Donor Registration & OTP Login
          </div>
          <h1 className="mt-6 text-4xl font-bold">Donate faster with a mobile-first donor experience.</h1>
          <p className="mt-4 text-base leading-8 text-white/75">
            Register once with your basic profile and dummy Aadhaar-style ID proof, then log in using a simulated OTP.
          </p>
          <div className="mt-10 space-y-4">
            {[
              "Secure donor session with JWT after OTP verification",
              "Donate food, clothes, books, money, and other essentials",
              "Choose a registered NGO before submitting a donation request"
            ].map((line) => (
              <div key={line} className="flex items-start gap-3 rounded-[22px] bg-white/10 p-4">
                <CheckCircle2 className="mt-1 text-moss" size={18} />
                <p className="text-sm leading-7 text-white/80">{line}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[34px] border border-white/70 bg-white/85 p-7 shadow-glow">
            <h2 className="text-2xl font-bold text-ink">Create donor account</h2>
            <p className="mt-2 text-sm text-ink/65">Use realistic dummy details for your academic or portfolio demo.</p>
            <form onSubmit={handleRegister} className="mt-6 grid gap-4 md:grid-cols-2">
              <Input label="Full name" value={registerForm.name} onChange={(value) => setRegisterForm((current) => ({ ...current, name: value }))} placeholder="Priya Verma" />
              <Input label="Mobile number" value={registerForm.mobile_number} onChange={(value) => setRegisterForm((current) => ({ ...current, mobile_number: value }))} placeholder="9876543210" />
              <Input label="ID proof (dummy Aadhaar)" value={registerForm.id_proof} onChange={(value) => setRegisterForm((current) => ({ ...current, id_proof: value }))} placeholder="AADHAAR-123456789012" />
              <Input label="City" value={registerForm.city} onChange={(value) => setRegisterForm((current) => ({ ...current, city: value }))} placeholder="Mumbai" />
              <button
                type="submit"
                disabled={loading}
                className="md:col-span-2 rounded-2xl bg-ink px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Register Donor"}
              </button>
            </form>
          </div>

          <div className="rounded-[34px] border border-white/70 bg-white/85 p-7 shadow-glow">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-coral/15 p-3 text-coral">
                <KeyRound size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-ink">Login with simulated OTP</h2>
                <p className="text-sm text-ink/65">Request OTP, use the demo code shown below, then continue.</p>
              </div>
            </div>

            <form onSubmit={handleRequestOtp} className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
              <Input
                label="Registered mobile number"
                value={loginForm.mobile_number}
                onChange={(value) => setLoginForm((current) => ({ ...current, mobile_number: value }))}
                placeholder="9876543210"
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-[30px] h-[52px] rounded-2xl bg-pine px-5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Request OTP
              </button>
            </form>

            {demoOtp ? (
              <div className="mt-5 rounded-[24px] border border-pine/15 bg-moss/60 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-pine">Demo OTP</p>
                <p className="mt-2 text-3xl font-bold tracking-[0.35em] text-ink">{demoOtp}</p>
                <p className="mt-2 text-sm text-ink/65">This is intentionally exposed because the OTP flow is simulated.</p>
              </div>
            ) : null}

            <form onSubmit={handleVerifyOtp} className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
              <Input
                label="Enter OTP"
                value={loginForm.otp_code}
                onChange={(value) => setLoginForm((current) => ({ ...current, otp_code: value }))}
                placeholder="123456"
                disabled={!requestSent}
              />
              <button
                type="submit"
                disabled={loading || !requestSent}
                className="mt-[30px] h-[52px] rounded-2xl bg-coral px-5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Verify & Login
              </button>
            </form>

            {status.message ? <Notice type={status.type} message={status.message} /> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function Input({ label, onChange, value, placeholder, disabled = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink/75">{label}</span>
      <input
        required
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3 text-ink outline-none transition focus:border-coral disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function Notice({ type, message }) {
  return (
    <div
      className={`mt-5 rounded-2xl px-4 py-3 text-sm font-medium ${
        type === "success" ? "bg-moss text-pine" : "bg-red-50 text-red-700"
      }`}
    >
      {message}
    </div>
  );
}
