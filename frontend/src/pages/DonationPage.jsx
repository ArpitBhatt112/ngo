import { HandCoins, PackageOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const defaultForm = {
  item_type: "Food",
  item_description: "",
  quantity: 1,
  amount: "",
  pickup_address: "",
  preferred_date: "",
  notes: "",
  ngo_id: ""
};

const itemTypes = ["Food", "Clothes", "Money", "Books", "Medicine", "Stationery", "Other"];

export default function DonationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [ngos, setNgos] = useState([]);
  const [ngosLoading, setNgosLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [form, setForm] = useState(defaultForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
          setLocationError("Location access denied. Showing all NGOs.");
        }
      );
    } else {
      setLocationError("Geolocation not supported. Showing all NGOs.");
    }
  }, []);

  useEffect(() => {
    setNgosLoading(true);
    const params = new URLSearchParams();
    if (userLocation) {
      params.append("latitude", userLocation.latitude.toString());
      params.append("longitude", userLocation.longitude.toString());
    }

    apiGet(`/ngos?${params.toString()}`)
      .then((data) => {
        setNgos(data);
        const preselected = searchParams.get("ngoId");
        const fallbackId = preselected || data[0]?.id || "";
        setForm((current) => ({ ...current, ngo_id: String(fallbackId) }));
      })
      .catch(() => setNgos([]))
      .finally(() => setNgosLoading(false));
  }, [searchParams, userLocation]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      await apiPost(
        "/donations",
        {
          ...form,
          quantity: Number(form.quantity),
          amount: form.amount ? Number(form.amount) : null,
          ngo_id: Number(form.ngo_id),
          preferred_date: form.preferred_date || null,
          notes: form.notes || null
        },
        session.token
      );
      setStatus({ type: "success", message: "Donation submitted successfully." });
      setTimeout(() => navigate("/donor-dashboard"), 1000);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="px-4 pb-16 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-8 py-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-6">
          <div className="rounded-[34px] bg-ink p-8 text-white shadow-glow">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
              <HandCoins size={16} />
              Donation Form
            </div>
            <h1 className="mt-6 text-4xl font-bold">Turn generosity into organized support.</h1>
            <p className="mt-4 text-base leading-8 text-white/75">
              Select the NGO, describe your donation, and share pickup details so the receiving organization can follow up.
            </p>
          </div>

          <div className="rounded-[34px] border border-white/70 bg-white/85 p-6 shadow-glow">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-moss p-3 text-pine">
                <PackageOpen size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-ink">Available NGOs</h2>
                <p className="text-sm text-ink/65">Choose one before submitting</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {ngos.map((ngo) => (
                <button
                  key={ngo.id}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, ngo_id: String(ngo.id) }))}
                  className={`w-full rounded-[24px] border p-4 text-left transition ${
                    String(ngo.id) === form.ngo_id
                      ? "border-pine bg-moss/55"
                      : "border-ink/10 bg-cream hover:border-coral"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-ink">{ngo.ngo_name}</h3>
                      <p className="mt-1 text-sm text-ink/65">
                        {ngo.city} • {ngo.government_ngo_id}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-pine">
                      Select
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-ink/70">{ngo.mission}</p>
                </button>
              ))}
            </div>

            {locationError && (
              <div className="mt-4 rounded-[24px] bg-amber-50 p-4 text-sm text-amber-700">
                {locationError}
              </div>
            )}
          </div>

          {form.ngo_id && (() => {
            const selectedNgo = ngos.find(ngo => String(ngo.id) === form.ngo_id);
            if (!selectedNgo) return null;
            return (
              <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-glow">
                <h2 className="text-2xl font-bold text-ink">Selected NGO Details</h2>
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoRow label="Organization" value={selectedNgo.ngo_name} />
                    <InfoRow label="Government ID" value={selectedNgo.government_ngo_id} />
                    <InfoRow label="Owner" value={selectedNgo.owner_name} />
                    <InfoRow label="Contact" value={selectedNgo.contact_number} />
                    <InfoRow label="Email" value={selectedNgo.email} />
                    <InfoRow label="City" value={selectedNgo.city} />
                    <InfoRow label="Account Balance" value={`Rs ${selectedNgo.account_balance?.toFixed(2) || '0.00'}`} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-ink/75">Mission:</span>
                    <p className="mt-1 text-sm text-ink/70">{selectedNgo.mission}</p>
                  </div>
                </div>
              </div>
            );
          })()}

        <div className="rounded-[34px] border border-white/70 bg-white/85 p-7 shadow-glow">
          <h2 className="text-2xl font-bold text-ink">Submit your donation</h2>
          <p className="mt-2 text-sm text-ink/65">All fields are validated before the API request is sent.</p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink/75">Item type</span>
              <select
                value={form.item_type}
                onChange={(event) => setForm((current) => ({ ...current, item_type: event.target.value }))}
                className="w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none transition focus:border-coral"
              >
                {itemTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <Input label="Quantity" type="number" min="1" value={form.quantity} onChange={(value) => setForm((current) => ({ ...current, quantity: value }))} placeholder="1" />
            <Input label="Amount (optional for money/items)" type="number" min="0" step="0.01" value={form.amount} onChange={(value) => setForm((current) => ({ ...current, amount: value }))} placeholder="5000" />
            <Input label="Preferred pickup date" type="date" value={form.preferred_date} onChange={(value) => setForm((current) => ({ ...current, preferred_date: value }))} />

            <label className="md:col-span-2 block">
              <span className="mb-2 block text-sm font-semibold text-ink/75">Item description</span>
              <textarea
                required
                minLength="10"
                rows="4"
                value={form.item_description}
                onChange={(event) => setForm((current) => ({ ...current, item_description: event.target.value }))}
                placeholder="Describe the donation clearly, including condition, size, quantity, or any important notes."
                className="w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none transition focus:border-coral"
              />
            </label>

            <label className="md:col-span-2 block">
              <span className="mb-2 block text-sm font-semibold text-ink/75">Pickup address</span>
              <textarea
                required
                minLength="10"
                rows="3"
                value={form.pickup_address}
                onChange={(event) => setForm((current) => ({ ...current, pickup_address: event.target.value }))}
                placeholder="House number, street, area, city"
                className="w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none transition focus:border-coral"
              />
            </label>

            <label className="md:col-span-2 block">
              <span className="mb-2 block text-sm font-semibold text-ink/75">Additional notes</span>
              <textarea
                rows="3"
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Any handling instructions or time preferences"
                className="w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none transition focus:border-coral"
              />
            </label>

            <button
              type="submit"
              disabled={loading || !form.ngo_id || ngosLoading}
              className="md:col-span-2 rounded-2xl bg-ink px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : ngosLoading ? "Loading NGOs..." : "Submit Donation"}
            </button>
          </form>

          {status.message ? (
            <div
              className={`mt-5 rounded-2xl px-4 py-3 text-sm font-medium ${
                status.type === "success" ? "bg-moss text-pine" : "bg-red-50 text-red-700"
              }`}
            >
              {status.message}
            </div>
          ) : null}
        </div>
      </div>
    </section>
    </main>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", min, step }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink/75">{label}</span>
      <input
        required={type !== "date"}
        type={type}
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3 outline-none transition focus:border-coral"
      />
    </label>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-[20px] bg-cream px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-ink/45">{label}</p>
      <p className="mt-1 text-base font-semibold text-ink">{value || "-"}</p>
    </div>
  );
}
