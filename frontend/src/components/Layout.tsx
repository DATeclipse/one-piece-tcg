import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Card Search" },
  { to: "/deck-builder", label: "Deck Builder" },
  { to: "/decks", label: "Deck View" },
  { to: "/tournaments", label: "Tournaments" },
  { to: "/meta", label: "Deck Analysis" },
  { to: "/collection", label: "Collection" },
  { to: "/glossary", label: "Glossary" },
];

function NavItem({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `no-underline ${isActive ? "text-accent" : "text-light"}`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center px-3 md:px-6 py-3 bg-card-bg border-b-2 border-accent">
        <span className="font-bold text-accent mr-4 text-sm md:text-base">
          OPTCG Deck Builder
        </span>

        <div className="hidden md:flex gap-4">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.to} to={link.to} label={link.label} />
          ))}
        </div>

        <button
          className="md:hidden ml-auto bg-transparent! text-light text-xl px-2 py-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden flex flex-col gap-3 px-4 py-3 bg-card-bg border-b border-border">
          {NAV_LINKS.map((link) => (
            <NavItem
              key={link.to}
              to={link.to}
              label={link.label}
              onClick={() => setMenuOpen(false)}
            />
          ))}
        </div>
      )}

      <main className="flex-1 p-2 md:p-4">
        <Outlet />
      </main>
    </div>
  );
}
