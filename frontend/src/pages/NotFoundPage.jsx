import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="px-4 pb-16 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl py-16">
        <div className="rounded-[34px] border border-white/70 bg-white/85 p-10 text-center shadow-glow">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pine">404</p>
          <h1 className="mt-4 text-4xl font-bold text-ink">This page does not exist.</h1>
          <p className="mt-4 text-base text-ink/70">Let’s get you back to the donation platform.</p>
          <Link
            to="/"
            className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
