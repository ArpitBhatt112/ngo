import { HeartHandshake, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? "bg-ink text-white" : "text-ink/70 hover:bg-white/70 hover:text-ink"
  }`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isDonor, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const links = isAuthenticated
    ? isDonor
      ? [
          { to: "/donor-dashboard", label: "Donor Dashboard" },
          { to: "/donate", label: "Donate Now" }
        ]
      : [{ to: "/ngo-dashboard", label: "NGO Dashboard" }]
    : [
        { to: "/", label: "Home" },
        { to: "/donor-auth", label: "Donor Access" },
        { to: "/ngo-auth", label: "NGO Access" }
      ];

  return (
    <header className="sticky top-0 z-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-white/75 px-5 py-3 shadow-glow backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
            <HeartHandshake size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-pine">CareBridge</p>
            <p className="text-sm font-semibold text-ink/70">NGO Donation Platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <Link
              to="/donor-auth"
              className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Get Started
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full border border-ink/10 p-2 text-ink md:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open ? (
        <div className="mx-auto mt-3 max-w-7xl rounded-3xl border border-white/70 bg-white/90 p-4 shadow-glow md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <Link
                to="/donor-auth"
                onClick={() => setOpen(false)}
                className="rounded-full bg-ink px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
