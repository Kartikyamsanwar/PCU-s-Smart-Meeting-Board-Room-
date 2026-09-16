import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader } from "../components/Card";
import { AttributionTag, ConfidenceBadge, StatusPill } from "../components/Badges";
import {
  actionItems, attendance, boardMemberName, decisions, meetingMinutes,
  meetings, signatures, speechSegments,
} from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { can } from "../permissions";

type Tab = "transcript" | "decisions" | "actions" | "attendance" | "mom";

function formatTs(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "transcript", label: "Live Transcript" },
  { id: "decisions", label: "Decisions" },
  { id: "actions", label: "Action Items" },
  { id: "attendance", label: "Attendance" },
  { id: "mom", label: "Minutes of Meeting" },
];

export function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("transcript");
  const [highlight, setHighlight] = useState<string | null>(null);
  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const meeting = meetings.find((m) => m.id === id);
  const segments = speechSegments.filter((s) => s.meeting_id === id);
  const meetingDecisions = decisions.filter((d) => d.meeting_id === id);
  const meetingActions = actionItems.filter((a) => a.meeting_id === id);
  const meetingAttendance = attendance.filter((a) => a.meeting_id === id);
  const minutes = id ? meetingMinutes[id] : undefined;
  const meetingSignatures = signatures.filter((s) => s.meeting_id === id);

  useEffect(() => {
    if (tab === "transcript" && highlight) {
      segmentRefs.current[highlight]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [tab, highlight]);

  if (!meeting) {
    return (
      <div className="text-sm text-[var(--text-muted)]">
        Meeting not found. <Link to="/meetings" className="text-[var(--accent-strong)]">Back to meetings</Link>
      </div>
    );
  }

  const jumpToEvidence = (segmentId: string) => {
    setHighlight(segmentId);
    setTab("transcript");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <Link to="/meetings" className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent-strong)]">
            ← All meetings
          </Link>
          <h1 className="mt-1 text-xl font-bold text-[var(--text)]">{meeting.title}</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {meeting.date} · {meeting.time} · {meeting.venue}
          </p>
        </div>
        <StatusPill status={meeting.status} />
      </div>

      <div className="flex gap-1 border-b border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-b-2 border-[var(--accent)] text-[var(--accent-strong)]"
                : "border-b-2 border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "transcript" && (
        <Card>
          <CardHeader title={`Transcript — ${segments.length} segment(s)`} />
          {segments.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
              No transcript yet — capture hasn't run for this meeting.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--border)]">
              {segments.map((seg) => (
                <div
                  key={seg.id}
                  ref={(el) => { segmentRefs.current[seg.id] = el; }}
                  className={`flex gap-4 px-5 py-3.5 transition-colors ${highlight === seg.id ? "bg-[var(--accent-soft)]" : ""}`}
                >
                  <div className="w-16 shrink-0 pt-0.5 font-mono text-xs tabular-nums text-[var(--text-muted)]">
                    {formatTs(seg.start_ts)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text)]">{seg.speaker_name}</span>
                      <ConfidenceBadge level={seg.confidence} />
                      <AttributionTag source={seg.attribution_source} />
                      {seg.overlap_flag && (
                        <span className="inline-flex items-center rounded-full border border-[var(--critical-border)] bg-[var(--critical-bg)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--critical)]">
                          OVERLAP
                        </span>
                      )}
                      {seg.microphone_unit_id != null && (
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">unit #{seg.microphone_unit_id}</span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text)]">{seg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "decisions" && (
        <Card>
          <CardHeader title={`Decisions — ${meetingDecisions.length}`} />
          {meetingDecisions.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">No decisions recorded yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {meetingDecisions.map((d) => (
                <li key={d.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-[var(--text)]">{d.text}</p>
                    <StatusPill status={d.status === "approved" ? "approved" : "draft"} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="text-xs text-[var(--text-muted)]">Evidence:</span>
                    {d.evidence_segment_ids.map((sid) => (
                      <button
                        key={sid}
                        onClick={() => jumpToEvidence(sid)}
                        className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
                      >
                        {sid}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === "actions" && (
        <Card className="overflow-hidden">
          <CardHeader title={`Action items — ${meetingActions.length}`} />
          {meetingActions.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">No action items recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Action</th>
                    <th className="px-5 py-3 font-medium">Owner</th>
                    <th className="px-5 py-3 font-medium">Deadline</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {meetingActions.map((a) => (
                    <tr key={a.id}>
                      <td className="max-w-xs px-5 py-3.5 text-[var(--text)]">{a.text}</td>
                      <td className="px-5 py-3.5 text-[var(--text-muted)]">{boardMemberName(a.responsible_board_member_id)}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs tabular-nums text-[var(--text-muted)]">
                        {a.deadline ?? "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusPill status={a.status === "in_progress" ? "in_progress_action" : a.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        {a.evidence_segment_ids.map((sid) => (
                          <button
                            key={sid}
                            onClick={() => jumpToEvidence(sid)}
                            className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
                          >
                            {sid}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "attendance" && (
        <Card className="overflow-hidden">
          <CardHeader title="Attendance" />
          {meetingAttendance.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">No attendance data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Board member</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Source</th>
                    <th className="px-5 py-3 font-medium">Confirmed by</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {meetingAttendance.map((a) => (
                    <tr key={a.board_member_id}>
                      <td className="px-5 py-3.5 font-medium text-[var(--text)]">{boardMemberName(a.board_member_id)}</td>
                      <td className="px-5 py-3.5"><StatusPill status={a.status} /></td>
                      <td className="px-5 py-3.5 font-mono text-xs text-[var(--text-muted)]">{a.source}</td>
                      <td className="px-5 py-3.5 text-[var(--text-muted)]">{a.confirmed_by ? boardMemberName(a.confirmed_by) : "Pending"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "mom" && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader
              title="Minutes status"
              action={
                minutes?.status !== "approved" && can(user?.role, "approve_mom") ? (
                  <button className="rounded-lg bg-[var(--accent)] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[var(--accent-strong)]">
                    Approve &amp; Sign
                  </button>
                ) : undefined
              }
            />
            <div className="flex items-center gap-3 px-5 py-4">
              <StatusPill status={minutes?.status ?? "draft"} />
              <span className="text-sm text-[var(--text-muted)]">
                {minutes?.status === "approved"
                  ? `Approved by ${minutes.approved_by} on ${minutes.approved_at?.slice(0, 10)}`
                  : "AI draft assembled from evidence-linked decisions and action items — pending human review."}
              </span>
            </div>
          </Card>

          {meetingSignatures.length > 0 && (
            <Card>
              <CardHeader title="Signatures" />
              <ul className="divide-y divide-[var(--border)]">
                {meetingSignatures.map((s) => (
                  <li key={s.user_id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{s.user_name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{s.designation}</p>
                    </div>
                    <span className="font-mono text-xs text-[var(--text-muted)]">{s.signed_at.replace("T", " ")}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <CardHeader title="Draft narrative" />
            <div className="px-5 py-4 text-sm leading-relaxed text-[var(--text)]">
              <p className="mb-3">
                <strong>Agenda:</strong> Q3 academic performance review; examination scheduling for the November cycle.
              </p>
              {meetingDecisions.map((d) => (
                <p key={d.id} className="mb-3">
                  <strong>Decision:</strong> {d.text}
                </p>
              ))}
              {meetingActions.map((a) => (
                <p key={a.id} className="mb-3">
                  <strong>Action:</strong> {a.text} — owner: {boardMemberName(a.responsible_board_member_id)}
                  {a.deadline ? `, due ${a.deadline}` : ""}.
                </p>
              ))}
              {meetingDecisions.length === 0 && meetingActions.length === 0 && (
                <p className="text-[var(--text-muted)]">Not enough extracted content yet to draft a narrative.</p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
