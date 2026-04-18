export default function StatCard({ label, value, accent = "bg-moss", hint }) {
  return (
    <div className="glass-card rounded-[28px] border border-white/60 p-5 shadow-glow">
      <div className={`mb-4 h-2 w-20 rounded-full ${accent}`} />
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/50">{label}</p>
      <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
      {hint ? <p className="mt-2 text-sm text-ink/65">{hint}</p> : null}
    </div>
  );
}
