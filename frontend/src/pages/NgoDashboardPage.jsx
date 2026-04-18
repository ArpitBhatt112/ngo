import { Building2, HeartHandshake, MessageSquare, Phone, ShieldCheck, CheckCircle, Truck, Package } from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPut } from "../lib/api";

export default function NgoDashboardPage() {
  const { session, updateProfile } = useAuth();
  const [profile, setProfile] = useState(session?.profile);
  const [stats, setStats] = useState({ donations_count: 0, total_amount: 0, donors_connected: 0 });
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  const updateDonationStatus = async (donationId, newStatus) => {
    try {
      await apiPut(`/donations/${donationId}/status`, { status: newStatus }, session.token);
      // Update local state
      setDonations(donations.map(d => 
        d.id === donationId ? { ...d, status: newStatus } : d
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    Promise.all([
      apiGet("/ngos/me", session.token),
      apiGet("/ngos/me/stats", session.token),
      apiGet("/ngos/me/donations", session.token),
      apiGet("/ngos/me/donors", session.token),
      apiGet("/messages", session.token)
    ]).then(([profileData, statsData, donationsData, donorsData, messagesData]) => {
      setProfile(profileData);
      updateProfile(profileData);
      setStats(statsData);
      setDonations(donationsData);
      setDonors(donorsData);
      setMessages(messagesData);
    }).catch((err) => setError(err.message));
  }, [session.token, updateProfile]);

  return (
    <main className="px-4 pb-16 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl py-8">
        <div className="rounded-[34px] bg-ink p-8 text-white shadow-glow">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">NGO Dashboard</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold">{profile?.ngo_name || "Organization"} is ready to receive support.</h1>
              <p className="mt-3 max-w-3xl text-base leading-8 text-white/75">{profile?.mission}</p>
            </div>
            <div className="rounded-[24px] bg-white/10 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Government NGO ID</p>
              <p className="mt-2 text-lg font-semibold">{profile?.government_ngo_id}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <StatCard label="Donations received" value={stats.donations_count} accent="bg-coral" />
          <StatCard label="Funds visible" value={`Rs ${Number(stats.total_amount).toFixed(2)}`} accent="bg-moss" />
          <StatCard label="Donors connected" value={stats.donors_connected} accent="bg-sand" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-glow">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-pine/10 p-3 text-pine">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-ink">Organization Details</h2>
                  <p className="text-sm text-ink/65">Core profile fields shown to the platform</p>
                </div>
              </div>
              <div className="mt-6 space-y-4 text-sm text-ink/75">
                <InfoRow label="Owner" value={profile?.owner_name} />
                <InfoRow label="Owner ID Proof" value={profile?.owner_id_proof} />
                <InfoRow label="Contact" value={profile?.contact_number} />
                <InfoRow label="Email" value={profile?.email} />
                <InfoRow label="City" value={profile?.city} />
              <InfoRow label="Account Balance" value={`Rs ${profile?.account_balance?.toFixed(2) || '0.00'}`} />
              </div>
            </div>

            <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-glow">
              <h2 className="text-2xl font-bold text-ink">Connected Donors</h2>
            <div className="mt-5 space-y-4">
              {error ? (
                <div className="rounded-[24px] bg-red-50 p-5 text-sm text-red-700">{error}</div>
              ) : null}
              {donors.length > 0 ? (
                  donors.map((donor) => (
                    <div key={donor.id} className="rounded-[24px] bg-cream p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-ink">{donor.name}</h3>
                          <p className="mt-1 text-sm text-ink/65">{donor.city}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-pine">
                          Verified profile
                        </span>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-ink/70">
                        <p className="flex items-center gap-2">
                          <Phone size={15} className="text-coral" />
                          {donor.mobile_number}
                        </p>
                        <p className="flex items-center gap-2">
                          <ShieldCheck size={15} className="text-pine" />
                          {donor.id_proof}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-ink/15 p-5 text-sm text-ink/65">
                    Donor profiles will appear here after donations are assigned to your NGO.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-glow">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-coral/15 p-3 text-coral">
                <HeartHandshake size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-ink">Received Donations</h2>
                <p className="text-sm text-ink/65">Every donor submission routed to your organization</p>
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
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-ink">{donation.item_type}</h3>
                        <p className="mt-1 text-sm text-ink/65">
                          From {donation.donor?.name} • {donation.donor?.mobile_number}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 md:items-end">
                        <StatusBadge status={donation.status} />
                        <StatusUpdateControls 
                          donationId={donation.id} 
                          currentStatus={donation.status} 
                          onUpdate={updateDonationStatus} 
                        />
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-ink/70">{donation.item_description}</p>
                    <div className="mt-4 grid gap-3 text-sm text-ink/70 md:grid-cols-2">
                      <p>Quantity: {donation.quantity}</p>
                      <p>{donation.amount ? `Amount: Rs ${Number(donation.amount).toFixed(2)}` : "Non-monetary donation"}</p>
                      <p>Pickup: {donation.pickup_address}</p>
                      <p>Preferred date: {donation.preferred_date || "Flexible"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-ink/15 p-6 text-sm text-ink/65">
                  No donations yet. Once donors choose your NGO, submissions will appear here.
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

function StatusUpdateControls({ donationId, currentStatus, onUpdate }) {
  const statusOptions = [
    'Pending Pickup',
    'Picked Up',
    'Received',
    'Delivered',
    'Cancelled'
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {statusOptions.map((status) => (
        <button
          key={status}
          onClick={() => onUpdate(donationId, status)}
          disabled={currentStatus === status}
          className={`rounded px-2 py-1 text-xs font-medium transition ${
            currentStatus === status
              ? 'bg-pine text-white cursor-not-allowed'
              : 'bg-white text-pine hover:bg-pine hover:text-white border border-pine'
          }`}
        >
          {status === 'Pending Pickup' ? 'Mark Pending' :
           status === 'Picked Up' ? 'Mark Picked' :
           status === 'Received' ? 'Mark Received' :
           status === 'Delivered' ? 'Mark Delivered' :
           'Cancel'}
        </button>
      ))}
    </div>
  );
}
