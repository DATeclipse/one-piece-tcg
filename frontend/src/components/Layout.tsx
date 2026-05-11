import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex gap-3 md:gap-4 px-3 md:px-6 py-3 bg-card-bg border-b-2 border-accent">
        <span className="font-bold text-accent mr-2 md:mr-4 text-sm md:text-base">
          OPTCG Deck Builder
        </span>
        <NavLink
          to="/cards"
          className={({ isActive }) =>
            `no-underline ${isActive ? "text-accent" : "text-light"}`
          }
        >
          Card Search
        </NavLink>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `no-underline ${isActive ? "text-accent" : "text-light"}`
          }
        >
          Deck Builder
        </NavLink>
        <NavLink
          to="/decks"
          className={({ isActive }) =>
            `no-underline ${isActive ? "text-accent" : "text-light"}`
          }
        >
          Deck View
        </NavLink>
        <NavLink
          to="/tournaments"
          className={({ isActive }) =>
            `no-underline ${isActive ? "text-accent" : "text-light"}`
          }
        >
          Tournaments
        </NavLink>
        <NavLink
          to="/meta"
          className={({ isActive }) =>
            `no-underline ${isActive ? "text-accent" : "text-light"}`
          }
        >
          Deck Analysis
        </NavLink>
        <NavLink
          to="/glossary"
          className={({ isActive }) =>
            `no-underline ${isActive ? "text-accent" : "text-light"}`
          }
        >
          Glossary
        </NavLink>
      </nav>
      <main className="flex-1 p-2 md:p-4">
        <Outlet />
      </main>
    </div>
  );
}
