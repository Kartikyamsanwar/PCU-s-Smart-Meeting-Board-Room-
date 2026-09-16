import type { AttributionSource, Confidence, ServiceState } from "../types";

const CONF_STYLE: Record<Confidence, string> = {
  HIGH: "text-[var(--good)] bg-[var(--good-bg)] border-[var(--good-border)]",
  MEDIUM: "text-[var(--warn)] bg-[var(--warn-bg)] border-[var(--warn-border)]",
  LOW: "text-[var(--critical)] bg-[var(--critical-bg)] border-[var(--critical-border)]",
};

export function ConfidenceBadge({ level }: { level: Confidence }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide ${CONF_STYLE[level]}`}>
      {level}
    </span>
  );
}

const SOURCE_LABEL: Record<AttributionSource, string> = {
  serial: "Serial event",
  diarization: "Diarization",
  manual: "Manual",
};

export function AttributionTag({ source }: { source: AttributionSource }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-muted)]">
      {SOURCE_LABEL[source]}
    </span>
  );
}

const STATE_STYLE: Record<ServiceState, { dot: string; label: string }> = {
  ok: { dot: "bg-[var(--good)]", label: "text-[var(--good)]" },
  degraded: { dot: "bg-[var(--warn)]", label: "text-[var(--warn)]" },
  down: { dot: "bg-[var(--critical)]", label: "text-[var(--critical)]" },
};

export function ServiceStateDot({ state }: { state: ServiceState }) {
  const s = STATE_STYLE[state];
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${s.dot}`} />;
}

const GENERIC_STYLE: Record<string, string> = {
  // meeting status
  scheduled: "text-[var(--text-muted)] bg-[var(--surface-2)] border-[var(--border)]",
  in_progress: "text-[var(--accent-strong)] bg-[var(--accent-soft)] border-[var(--accent)]",
  completed: "text-[var(--good)] bg-[var(--good-bg)] border-[var(--good-border)]",
  mom_approved: "text-[var(--good)] bg-[var(--good-bg)] border-[var(--good-border)]",
  // attendance
  PRESENT: "text-[var(--good)] bg-[var(--good-bg)] border-[var(--good-border)]",
  LATE: "text-[var(--warn)] bg-[var(--warn-bg)] border-[var(--warn-border)]",
  LEFT_EARLY: "text-[var(--warn)] bg-[var(--warn-bg)] border-[var(--warn-border)]",
  ABSENT: "text-[var(--critical)] bg-[var(--critical-bg)] border-[var(--critical-border)]",
  NOT_CONFIRMED: "text-[var(--text-muted)] bg-[var(--surface-2)] border-[var(--border)]",
  // action items
  open: "text-[var(--warn)] bg-[var(--warn-bg)] border-[var(--warn-border)]",
  in_progress_action: "text-[var(--accent-strong)] bg-[var(--accent-soft)] border-[var(--accent)]",
  done: "text-[var(--good)] bg-[var(--good-bg)] border-[var(--good-border)]",
  // minutes
  draft: "text-[var(--text-muted)] bg-[var(--surface-2)] border-[var(--border)]",
  reviewed: "text-[var(--warn)] bg-[var(--warn-bg)] border-[var(--warn-border)]",
  approved: "text-[var(--good)] bg-[var(--good-bg)] border-[var(--good-border)]",
};

const GENERIC_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  mom_approved: "MoM Approved",
  PRESENT: "Present",
  LATE: "Late",
  LEFT_EARLY: "Left Early",
  ABSENT: "Absent",
  NOT_CONFIRMED: "Not Confirmed",
  open: "Open",
  in_progress_action: "In Progress",
  done: "Done",
  draft: "Draft",
  reviewed: "Reviewed",
  approved: "Approved",
};

export function StatusPill({ status }: { status: string }) {
  const style = GENERIC_STYLE[status] ?? "text-[var(--text-muted)] bg-[var(--surface-2)] border-[var(--border)]";
  const label = GENERIC_LABEL[status] ?? status;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
