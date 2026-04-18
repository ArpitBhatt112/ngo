import { ArrowRight, Building2, Gift, Heart, MessageSquare, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../lib/api";

export default function DonorDashboardPage() {
  const { session, updateProfile } = useAuth();
  const [profile, setProfile] = useState(session?.profile);
  const [stats, setStats] = useState({ donations_count: 0, total_amount: 0, ngos_supported: 0 });
  const [donations, setDonations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet("/donors/me", session.token),
      apiGet("/donors/me/stats", session.token),
      apiGet("/donors/me/donations", session.token),
      apiGet("/messages", session.token)
    ])
      .then(([profileData, statsData, donationsData, messagesData]) => {
        setProfile(profileData);
        updateProfile(profileData);
        setStats(statsData);
        setDonations(donationsData);
        setMessages(messagesData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session.token, updateProfile]);

  return (
    <main className="px-4 pb-16 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl py-8">
        <div className="rounded-[34px] border border-white/70 bg-white/85 p-8 shadow-glow">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pine">Donor Dashboard</p>
              <h1 className="mt-3 text-4xl font-bold text-ink">Welcome back, {profile?.name || "Donor"}.</h1>
              <p className="mt-3 max-w-2xl text-base leading-8 text-ink/70">
                Track your donation history, view NGOs you have supported, and start a new donation whenever you are ready.
              </p>
            </div>
            <Link
              to="/donate"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
            >
              Create Donation
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <StatCard label="Donations made" value={loading ? "..." : stats.donations_count} accent="bg-coral" />
          <StatCard
            label="Money pledged"
            value={loading ? "..." : `Rs ${Number(stats.total_amount).toFixed(2)}`}
            accent="bg-pine"
          />
          <StatCard label="NGOs supported" value={loading ? "..." : stats.ngos_supported} accent="bg-sand" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-glow">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-moss p-3 text-pine">
                <UserRound size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-ink">Profile</h2>
                <p className="text-sm text-ink/65">Stored donor information</p>
              </div>
            </div>
            <div className="mt-6 space-y-4 text-sm text-ink/75">
              <InfoRow label="Name" value={profile?.name} />
              <InfoRow label="Mobile" value={profile?.mobile_number} />
              <InfoRow label="ID Proof" value={profile?.id_proof} />
              <InfoRow label="City" value={profile?.city} />
            </div>
          </div>

          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-glow">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-ink">Recent Donations</h2>
                <p className="text-sm text-ink/65">Visible to the NGOs you selected</p>
              </div>
              <div className="rounded-full bg-ink/5 px-4 py-2 text-sm font-semibold text-ink/60">
                {donations.length} entries
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {error ? (
                <div className="rounded-[24px] bg-red-50 p-5 text-sm text-red-700">{error}</div>
              ) : null}
              {donations.length > 0 ? (
                donations.map((donation) => (
                  <div key={donation.id} className="rounded-[24px] bg-cream p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-ink">
                          <Gift size={18} className="text-coral" />
                          <h3 className="text-lg font-bold">{donation.item_type}</h3>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-ink/70">{donation.item_description}</p>
                      </div>
                      <StatusBadge status={donation.status} />
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-ink/70 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-pine" />
                        {donation.ngo?.ngo_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart size={16} className="text-coral" />
                        Quantity: {donation.quantity}
                        {donation.amount ? ` • Rs ${Number(donation.amount).toFixed(2)}` : ""}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-ink/15 p-6 text-sm text-ink/65">
                  No donations yet. Start with your first contribution from the donation page.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-glow">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-ink">Messages</h2>
                <p className="text-sm text-ink/65">Communication with NGOs</p>
              </div>
              <div className="rounded-full bg-ink/5 px-4 py-2 text-sm font-semibold text-ink/60">
                {messages.length} messages
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {messages.length > 0 ? (
                messages.slice(0, 5).map((message) => (
                  <div key={message.id} className={`rounded-[24px] p-4 ${message.is_read ? 'bg-cream' : 'bg-moss/30 border border-pine/20'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink">
                            {message.sender_ngo ? message.sender_ngo.ngo_name : 'You'}
                          </span>
                          <span className="text-xs text-ink/60">
                            to {message.receiver_ngo ? message.receiver_ngo.ngo_name : 'You'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-ink/80">{message.content}</p>
                        <p className="mt-1 text-xs text-ink/50">
                          {new Date(message.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!message.is_read && (
                        <span className="rounded-full bg-pine px-2 py-1 text-xs font-semibold text-white">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-ink/15 p-6 text-sm text-ink/65">
                  No messages yet. Messages with NGOs will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
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

function StatusBadge({ status }) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending pickup':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked up':
        return 'bg-blue-100 text-blue-800';
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}
