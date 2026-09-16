import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { StatusPill } from "../components/Badges";
import { meetings } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { can } from "../permissions";

export function Meetings() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Meetings</h1>
          <p className="text-sm text-[var(--text-muted)]">All board and committee meetings.</p>
        </div>
        {can(user?.role, "create_meeting") && (
          <button className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-strong)]">
            + New Meeting
          </button>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-wide text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Meeting</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Venue</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {meetings.map((m) => (
                <tr key={m.id} className="hover:bg-[var(--surface-2)]">
                  <td className="px-5 py-3.5">
                    <Link to={`/meetings/${m.id}`} className="font-medium text-[var(--text)] hover:text-[var(--accent-strong)]">
                      {m.title}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs tabular-nums text-[var(--text-muted)]">
                    {m.date} · {m.time}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-muted)]">{m.venue}</td>
                  <td className="px-5 py-3.5 text-[var(--text-muted)]">{m.type}</td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={m.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
