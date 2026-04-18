import {
  ArrowRight,
  BadgeIndianRupee,
  BookHeart,
  Boxes,
  Building2,
  HandHeart,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";

const highlights = [
  {
    title: "OTP-secured donor onboarding",
    description: "Simulated mobile OTP login keeps the donor journey simple and fast for demos and academic submissions.",
    icon: Smartphone
  },
  {
    title: "NGO-specific donation routing",
    description: "Every donation is mapped to a chosen NGO, which makes collection, reporting, and donor visibility easier.",
    icon: Building2
  },
  {
    title: "Multi-category donation support",
    description: "Food, clothes, books, money, and essentials can all be submitted from a single clean donation form.",
    icon: Boxes
  },
  {
    title: "Verified-looking data flow",
    description: "Dummy Aadhaar-style ID fields, NGO registration IDs, JWT auth, and dashboards create a realistic full-stack workflow.",
    icon: ShieldCheck
  }
];

export default function HomePage() {
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    apiGet("/ngos")
      .then(setNgos)
      .catch(() => setNgos([]));
  }, []);

  return (
    <main className="px-4 pb-16 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-10 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:py-12">
        <div className="animate-rise rounded-[36px] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur xl:p-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pine/15 bg-pine/10 px-4 py-2 text-sm font-semibold text-pine">
            <HandHeart size={16} />
            Bridging donors and trusted NGOs
          </div>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-ink sm:text-5xl xl:text-6xl">
            A polished donation platform for NGOs, donors, and real project demos.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
            CareBridge helps donors register with mobile OTP simulation, select an NGO, donate resources,
            and track their contribution history while NGOs view donors and received donations in one place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/donor-auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
            >
              Join as Donor
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/ngo-auth"
              className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-white px-6 py-3 text-base font-semibold text-ink transition hover:bg-ink hover:text-white"
            >
              Register Your NGO
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-sand p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/50">Flows</p>
              <p className="mt-2 text-3xl font-bold text-ink">6+</p>
              <p className="mt-2 text-sm text-ink/70">End-to-end pages with real API integration</p>
            </div>
            <div className="rounded-[24px] bg-moss p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/50">Auth</p>
              <p className="mt-2 text-3xl font-bold text-ink">JWT</p>
              <p className="mt-2 text-sm text-ink/70">Protected donor and NGO dashboards</p>
            </div>
            <div className="rounded-[24px] bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/50">Database</p>
              <p className="mt-2 text-3xl font-bold text-ink">SQLite</p>
              <p className="mt-2 text-sm text-ink/70">Simple local setup for smooth evaluation</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="animate-float rounded-[32px] border border-white/70 bg-ink p-8 text-white shadow-glow">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">Impact Snapshot</p>
            <div className="mt-8 grid gap-4">
              <div className="rounded-[24px] bg-white/10 p-5">
                <div className="flex items-center gap-3">
                  <BadgeIndianRupee className="text-coral" />
                  <div>
                    <p className="text-sm text-white/60">Flexible donations</p>
                    <p className="text-xl font-bold">Money + essentials</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] bg-white/10 p-5">
                <div className="flex items-center gap-3">
                  <BookHeart className="text-moss" />
                  <div>
                    <p className="text-sm text-white/60">Education support</p>
                    <p className="text-xl font-bold">Books and school kits</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] bg-white/10 p-5">
                <div className="flex items-center gap-3">
                  <Boxes className="text-sand" />
                  <div>
                    <p className="text-sm text-white/60">Community relief</p>
                    <p className="text-xl font-bold">Food, clothes, supplies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-glow">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/45">Featured NGOs</p>
            <div className="mt-4 space-y-4">
              {ngos.slice(0, 3).map((ngo) => (
                <div key={ngo.id} className="rounded-[24px] border border-ink/8 bg-cream p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-ink">{ngo.ngo_name}</h3>
                      <p className="mt-1 text-sm text-ink/65">
                        {ngo.city} • Gov ID: {ngo.government_ngo_id}
                      </p>
                    </div>
                    <span className="rounded-full bg-pine/10 px-3 py-1 text-xs font-semibold text-pine">
                      Active NGO
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink/70">{ngo.mission}</p>
                </div>
              ))}
              {ngos.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-ink/20 p-5 text-sm text-ink/70">
                  NGOs will appear here after backend startup.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="animate-rise rounded-[30px] border border-white/70 bg-white/75 p-6 shadow-glow backdrop-blur"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="mb-4 inline-flex rounded-2xl bg-ink p-3 text-white">
                  <Icon size={20} />
                </div>
                <h3 className="text-xl font-bold text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/70">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
