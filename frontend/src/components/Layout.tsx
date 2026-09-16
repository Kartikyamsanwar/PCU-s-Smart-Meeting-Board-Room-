import type { ReactNode } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { can } from "../permissions";
import { ROLE_LABEL } from "../permissions";

const ICONS: Record<string, ReactNode> = {
  dashboard: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h4.5v7.5h-4.5V12Zm6-6.75h4.5V19.5h-4.5V5.25Zm6 4.5h4.5v9.75h-4.5V9.75Z" />
  ),
  meetings: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 6h15a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75V6.75A.75.75 0 0 1 4.5 6Z" />
  ),
  mapping: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.75 6.75 0 1 0 0-13.5 6.75 6.75 0 0 0 0 13.5ZM12 12a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0 0v6.75" />
  ),
  health: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3.5l2-5 3 10 2.5-8 1.5 3H21" />
  ),
  users: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.5v-1.5a3.75 3.75 0 0 0-3.75-3.75h-4.5A3.75 3.75 0 0 0 3 18v1.5M9 11.25a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm9.75 8.25V18a3.75 3.75 0 0 0-2.625-3.577M14.25 5.06a3 3 0 0 1 0 5.88" />
  ),
};

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4.5 w-4.5">
      {ICONS[name]}
    </svg>
  );
}

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" as const, show: () => true },
  { to: "/meetings", label: "Meetings", icon: "meetings" as const, show: () => true },
  { to: "/mapping", label: "Mic Mapping", icon: "mapping" as const, show: (r: ReturnType<typeof useAuth>["user"]) => can(r?.role, "configure_mic_mapping") },
  { to: "/system-health", label: "System Health", icon: "health" as const, show: (r: ReturnType<typeof useAuth>["user"]) => can(r?.role, "system_health") },
  { to: "/users", label: "User Management", icon: "users" as const, show: (r: ReturnType<typeof useAuth>["user"]) => can(r?.role, "user_management") },
];

export function Layout() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <aside className="flex w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
        <div className="px-5 py-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent)]">PCU · SBMIS</p>
          <p className="mt-0.5 text-sm font-semibold">Board Meeting Console</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.filter((item) => item.show(user)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                }`
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[var(--border)] px-5 py-4 text-xs text-[var(--text-muted)]">
          Phase 4 UI scaffold — reads mock data.
          <br />
          No live backend yet.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6 py-3">
          <div />
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <div className="flex items-center gap-2.5">
              <div className="text-right leading-tight">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{ROLE_LABEL[user.role]}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] font-mono text-xs font-semibold text-[var(--accent-strong)]">
                {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
            </div>
            <button
              onClick={signOut}
              className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
