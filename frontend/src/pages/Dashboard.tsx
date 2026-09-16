import { Link } from "react-router-dom";
import { Card, CardHeader } from "../components/Card";
import { ServiceStateDot, StatusPill } from "../components/Badges";
import { boardMembers, firstName, meetings, meetingMinutes, microphoneUnits, systemHealth } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { can } from "../permissions";

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[var(--text)]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[var(--text-muted)]">{sub}</p>}
    </Card>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const pendingApprovals = Object.values(meetingMinutes).filter((m) => m.status === "reviewed").length;
  const upcoming = meetings.filter((m) => m.status === "scheduled" || m.status === "in_progress");
  const recentApproved = meetings
    .filter((m) => m.status === "mom_approved")
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)]">Welcome, {user ? firstName(user.name) : ""}</h1>
        <p className="text-sm text-[var(--text-muted)]">Here's what's happening across the board this term.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Meetings this term" value={String(meetings.length)} />
        <StatTile label="Pending MoM approval" value={String(pendingApprovals)} sub="Awaiting chairperson sign-off" />
        <StatTile label="Board members" value={String(boardMembers.length)} />
        <StatTile label="Mic units active" value={`${microphoneUnits.filter((u) => u.status === "active").length} / ${microphoneUnits.length}`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Upcoming &amp; in-progress meetings" />
          <ul className="divide-y divide-[var(--border)]">
            {upcoming.map((m) => (
              <li key={m.id}>
                <Link to={`/meetings/${m.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--surface-2)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{m.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {m.date} · {m.time} · {m.venue}
                    </p>
                  </div>
                  <StatusPill status={m.status} />
                </Link>
              </li>
            ))}
            {upcoming.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-[var(--text-muted)]">Nothing scheduled.</li>
            )}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="System health"
            action={
              can(user?.role, "system_health") ? (
                <Link to="/system-health" className="text-xs font-medium text-[var(--accent-strong)] hover:underline">
                  Details
                </Link>
              ) : undefined
            }
          />
          <div className="flex flex-col gap-3 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-[var(--text-muted)]">
                <ServiceStateDot state={systemHealth.audio_tap.state} /> Audio tap
              </span>
              <span className="text-[var(--text)]">Nominal</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-[var(--text-muted)]">
                <ServiceStateDot state={systemHealth.serial_link.state} /> Serial link
              </span>
              <span className="text-[var(--warn)]">Fallback (Plan C)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-[var(--text-muted)]">
                <ServiceStateDot state={systemHealth.websocket.state} /> WebSocket
              </span>
              <span className="text-[var(--text)]">Connected</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recently approved minutes" />
        <ul className="divide-y divide-[var(--border)]">
          {recentApproved.map((m) => (
            <li key={m.id}>
              <Link to={`/meetings/${m.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--surface-2)]">
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{m.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{m.date}</p>
                </div>
                <StatusPill status={m.status} />
              </Link>
            </li>
          ))}
          {recentApproved.length === 0 && (
            <li className="px-5 py-6 text-center text-sm text-[var(--text-muted)]">None yet.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
