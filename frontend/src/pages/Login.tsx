import { useNavigate } from "react-router-dom";
import { currentUsers } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABEL } from "../permissions";

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = (userId: string) => {
    signIn(userId);
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--accent)]">
            PCU Smart Board Meeting Intelligence System
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text)]">Board Meeting Console</h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            This is a UI scaffold over mock data — no live backend yet (Phase 0–2
            are gated on hardware discovery). Pick a demo user to see their view.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-sm">
          {currentUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => handleSignIn(u.id)}
              className="flex items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-[var(--surface-2)]"
            >
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{u.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{u.designation}</p>
              </div>
              <span className="rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--accent-strong)]">
                {ROLE_LABEL[u.role]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
