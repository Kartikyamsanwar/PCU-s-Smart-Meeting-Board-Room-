import { Card, CardHeader } from "../components/Card";
import { ServiceStateDot } from "../components/Badges";
import { systemHealth } from "../data/mockData";
import type { ServiceState } from "../types";

const STATE_TEXT: Record<ServiceState, string> = { ok: "Nominal", degraded: "Degraded", down: "Down" };

function HealthRow({ label, state, detail }: { label: string; state: ServiceState; detail: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 last:border-b-0">
      <div className="flex items-center gap-3">
        <ServiceStateDot state={state} />
        <div>
          <p className="text-sm font-medium text-[var(--text)]">{label}</p>
          <p className="text-xs text-[var(--text-muted)]">{detail}</p>
        </div>
      </div>
      <span
        className={`font-mono text-xs font-semibold ${
          state === "ok" ? "text-[var(--good)]" : state === "degraded" ? "text-[var(--warn)]" : "text-[var(--critical)]"
        }`}
      >
        {STATE_TEXT[state]}
      </span>
    </div>
  );
}

export function SystemHealth() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text)]">System / Audio Health</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Live pipeline status per Blueprint Section F.22: audio tap, serial link, STT queue, WebSocket.
        </p>
      </div>

      <Card>
        <CardHeader title="Pipeline components" />
        <HealthRow label="Audio tap" state={systemHealth.audio_tap.state} detail={systemHealth.audio_tap.detail} />
        <HealthRow label="Serial link (RS232/RS485)" state={systemHealth.serial_link.state} detail={systemHealth.serial_link.detail} />
        <HealthRow label="WebSocket" state={systemHealth.websocket.state} detail={systemHealth.websocket.detail} />
      </Card>

      <Card className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">STT queue depth</p>
        <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[var(--text)]">
          {systemHealth.stt_queue_depth}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Segments awaiting transcription.</p>
      </Card>

      <Card className="border-[var(--warn-border)] bg-[var(--warn-bg)] p-5">
        <p className="text-sm font-semibold text-[var(--warn)]">Plan C fallback active</p>
        <p className="mt-1 text-sm text-[var(--text)]">
          The Vāk 40.s RS232/RS485 protocol has not been confirmed (Blueprint Section 6). Speaker attribution is
          running on diarization only — deterministic serial-event attribution (Plan A/B) will take over
          automatically once hardware access is verified and the parser is wired in.
        </p>
      </Card>
    </div>
  );
}
