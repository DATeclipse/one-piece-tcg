import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex gap-4 px-6 py-3 bg-card-bg border-b-2 border-accent">
        <span className="font-bold text-accent mr-4">OPTCG Deck Builder</span>
        <NavLink
          to="/"
          className={({ isActive }) => `no-underline ${isActive ? "text-accent" : "text-light"}`}
        >
          Deck Builder
        </NavLink>
        <NavLink
          to="/meta"
          className={({ isActive }) => `no-underline ${isActive ? "text-accent" : "text-light"}`}
        >
          Meta & Strategy
        </NavLink>
      </nav>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
