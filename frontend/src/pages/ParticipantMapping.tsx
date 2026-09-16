import { useState } from "react";
import { Card, CardHeader } from "../components/Card";
import { boardMembers, meetings, microphoneUnits, participantMappings } from "../data/mockData";

export function ParticipantMapping() {
  const [meetingId, setMeetingId] = useState(meetings[0]?.id);
  const [mappings, setMappings] = useState(() =>
    Object.fromEntries(
      participantMappings
        .filter((m) => m.meeting_id === meetingId)
        .map((m) => [m.board_member_id, m.microphone_unit_id])
    )
  );

  const selectMeeting = (id: string) => {
    setMeetingId(id);
    setMappings(
      Object.fromEntries(
        participantMappings.filter((m) => m.meeting_id === id).map((m) => [m.board_member_id, m.microphone_unit_id])
      )
    );
  };

  const usedUnits = new Set(Object.values(mappings).filter((v): v is number => v != null));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)]">Participant / Microphone Mapping</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Maps board members to Vāk delegate-unit IDs for a meeting — not "channels," since the hardware
          doesn't expose per-mic audio channels (Blueprint Section 0 / F.22).
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-[var(--text-muted)]">Meeting</label>
        <select
          value={meetingId}
          onChange={(e) => selectMeeting(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text)]"
        >
          {meetings.map((m) => (
            <option key={m.id} value={m.id}>{m.title} — {m.date}</option>
          ))}
        </select>
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Board member ↔ microphone unit" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-wide text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-3 font-medium">Board member</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Assigned unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {boardMembers.map((bm) => {
                const assigned = mappings[bm.id] ?? null;
                return (
                  <tr key={bm.id}>
                    <td className="px-5 py-3.5 font-medium text-[var(--text)]">{bm.name}</td>
                    <td className="px-5 py-3.5 text-[var(--text-muted)]">{bm.department}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={assigned ?? ""}
                        onChange={(e) =>
                          setMappings((prev) => ({
                            ...prev,
                            [bm.id]: e.target.value === "" ? null : Number(e.target.value),
                          }))
                        }
                        className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 font-mono text-xs text-[var(--text)]"
                      >
                        <option value="">Unassigned</option>
                        {microphoneUnits.map((u) => (
                          <option
                            key={u.unit_id}
                            value={u.unit_id}
                            disabled={usedUnits.has(u.unit_id) && assigned !== u.unit_id}
                          >
                            Unit #{u.unit_id} ({u.unit_type})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title={`Microphone unit inventory — ${microphoneUnits.length} units`} />
        <div className="flex flex-wrap gap-2 px-5 py-4">
          {microphoneUnits.map((u) => (
            <span
              key={u.unit_id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs ${
                usedUnits.has(u.unit_id)
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                  : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]"
              }`}
            >
              #{u.unit_id}
              {u.unit_type === "chairman" && <span className="text-[10px] uppercase">chair</span>}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
