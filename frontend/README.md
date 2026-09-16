# SBMIS — Frontend (Phase 4 UI scaffold)

React + Vite + TypeScript + Tailwind CSS console for the Board Meeting
Intelligence System, per Blueprint Section F.22. This is a **UI scaffold
over mock data** — there's no backend yet (Phase 0–2, the speaker-attribution
work, are gated on the RS232 hardware discovery in Section 6), so every page
reads from [`src/data/mockData.ts`](src/data/mockData.ts) instead of a live
API.

All data shapes in [`src/types.ts`](src/types.ts) mirror the Blueprint's DB
schema (Section F.20) field-for-field, so pointing this at the real FastAPI
backend later is a data-source swap, not a redesign — replace the imports
from `mockData.ts` with `fetch`/React Query calls returning the same shapes.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. Pick any of the five demo users on the
login screen to see the app through that role's eyes.

## What's built

- **Login** — mock user picker (no real auth backend yet)
- **Dashboard** — quick stats, upcoming meetings, system health summary
- **Meetings** — list with status pills
- **Meeting detail** — tabbed: Live Transcript (confidence-banded,
  attribution-tagged, overlap-flagged per Section F.9/F.12), Decisions and
  Action Items (each with clickable evidence links that jump to and
  highlight the source transcript segment — Section F.19's anti-hallucination
  requirement made visible), Attendance (three-signal model, Section F.16),
  and Minutes of Meeting (draft narrative + approve/sign workflow, Section
  F.18)
- **Participant / Microphone Mapping** — board member ↔ Vāk unit ID, not
  "channel," per the Section 0 hardware correction
- **System / Audio Health** — audio tap, serial link, STT queue, WebSocket
  status (Section F.22), including a visible "Plan C fallback active" banner
  since RS232 access is still unconfirmed
- **User Management** — the RBAC permission matrix from Section F.25,
  rendered as an actual table, not just documentation

RBAC is enforced client-side throughout: the sidebar nav, page access, and
action buttons (New Meeting, Approve & Sign, etc.) all key off the same
`can(role, action)` matrix in [`src/permissions.ts`](src/permissions.ts) that
mirrors Section F.25 exactly — switch users on the login screen to see it
change.

Light/dark theme follows the OS by default and can be toggled manually
(persisted to `localStorage`).

## What this doesn't do yet

No real backend, no WebSocket, no persistence — refreshing loses your signed-in
session (in-memory only). That's intentional: this is the frontend track's
parallel-build deliverable per Section F.37, built independent of the
speaker-ID work while Phase 0 hardware discovery is still pending.

## Next steps

Once a FastAPI backend exists (Section F.23), swap `src/data/mockData.ts`
reads for real API calls using the same `types.ts` shapes, wire the
WebSocket event schema from Section F.24 into the Live Transcript tab for
true real-time updates, and replace the mock login with real JWT auth.
