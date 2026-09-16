import { Card, CardHeader } from "../components/Card";
import { currentUsers } from "../data/mockData";
import { ROLE_LABEL, type Action } from "../permissions";
import { can } from "../permissions";
import type { Role } from "../types";

const ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "CHAIRPERSON", "BOARD_MEMBER", "VIEWER"];

const ACTIONS: { id: Action; label: string }[] = [
  { id: "create_meeting", label: "Create meeting" },
  { id: "configure_mic_mapping", label: "Configure mic mapping" },
  { id: "view_live_transcript", label: "View live transcript" },
  { id: "edit_transcript", label: "Edit/correct transcript" },
  { id: "approve_mom", label: "Approve final MoM" },
  { id: "view_approved_mom", label: "View approved MoM" },
  { id: "system_health", label: "System/audio health" },
  { id: "user_management", label: "User management" },
];

export function UserManagement() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)]">User Management</h1>
        <p className="text-sm text-[var(--text-muted)]">RBAC roles and the exact permission matrix from Blueprint Section F.25.</p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Users" />
        <ul className="divide-y divide-[var(--border)]">
          {currentUsers.map((u) => (
            <li key={u.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{u.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{u.designation}</p>
              </div>
              <span className="rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--accent-strong)]">
                {ROLE_LABEL[u.role]}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Permission matrix" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-wide text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Action</th>
                {ROLES.map((r) => (
                  <th key={r} className="px-3 py-3 text-center font-medium">{ROLE_LABEL[r]}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {ACTIONS.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3 text-[var(--text)]">{a.label}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="px-3 py-3 text-center font-mono">
                      {can(r, a.id) ? (
                        <span className="text-[var(--good)]">✓</span>
                      ) : (
                        <span className="text-[var(--text-muted)]">–</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
