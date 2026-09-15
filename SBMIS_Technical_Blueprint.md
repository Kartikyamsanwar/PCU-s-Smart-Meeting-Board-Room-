# PCU Smart Board Meeting Intelligence System (SBMIS)
## Master Technical Blueprint — v1.0

---

## 0. Read This First: The Single Most Important Finding

Your proposed architecture assumes 20 microphones arrive at the computer as **20 discrete audio channels**, and that speaker ID = "which channel is active." Photographic evidence of the installed hardware contradicts this assumption. This changes the whole speaker-identification and parallel-speech design. Everything else in your spec (STT choice, VAD, DB schema, MoM workflow, security, deployment) is largely unaffected and proceeds close to as you designed it.

### What's actually installed (identified from photos)

| Component | What it is | Evidence |
|---|---|---|
| **Studiomaster Professional Vāk 40.s** | UHF wireless conference main controller. Supports up to 200 delegate/chairman units, 10 UHF channels, 4 operating modes (FIFO/LIFO/Limit/Chairman), digital voting, camera tracking (VISCA/PELCO). | Front panel branding, touchscreen "Home/Control/Setup/Vote" tabs, "Online unit number: 17" |
| **Vāk 40.d delegate/chairman units** | Individual gooseneck mic units with TFT display, voting keypad, sign-in, mic on/off LED. Daisy-chained via proprietary cable, not simple XLR wireless-to-channel. | Close-up photos, "Checking is over, Unit is online" screen |
| **Vāk 40.s rear panel I/O** | Balanced Out (master mix), Mixer/Media Out, 2× UHF antenna (BNC), 2× RS232 (DB9), 1× terminal block (RS485-style), USB (built-in MP3 recorder only) | Direct photo of rear panel |
| **AHUJA SSA-250M + AI-22** | Separate/legacy 6-input PA amplifier + a basic 2-channel USB audio interface, sitting in the same rack | Photo, labeled panel |
| **SM Professional "Orb 822 SC"** | Second, independent 12-channel analog mixer downstream, summing: Conference MIC (from Vāk), 2× Headset/Collar Mic, TV Audio, Zoom Audio | Photo with hand-written channel labels |
| **Room PC + interactive display** | Windows PC already installed, driving a large touch display, with OBS Studio, VLC, Chrome installed; PTZ camera on ceiling | Photo of display |

### Why this matters

1. **No per-microphone discrete audio exists at any exposed output.** The published Vāk 40 spec confirms a single balanced/master output design — this is consistent with everything visible on the rear panel. "Channel = speaker" via audio routing, as literally described in your Section 2, is **not achievable** with this hardware alone.
2. **Hardware caps simultaneous open mics at 4 (NOM).** This actually *bounds* your parallel-speech problem (never more than ~4-way overlap) — but it also means overlap is common by design (Discussion mode lets multiple delegates hold the floor).
3. **The Vāk's mixed output is not even the last stop.** It gets summed again with collar mics, TV audio, and Zoom audio in a second mixer before it would reach any USB/recording tap — unless you capture directly from the Vāk's own dedicated Record/Balanced Out.
4. **The RS232 ports + terminal block are your real opportunity.** Conference systems in this product class (confirmed by the vendor's own Vāk 50 manual and comparable products) expose serial control protocols reporting **per-unit ON/OFF events with unit IDs** — this is metadata, not audio, but it's exactly the deterministic "who is speaking" signal you wanted from channel routing. This is the pivot that saves your speaker-ID architecture.

### UNVERIFIED — must be confirmed by AV/IT team before Phase 1

- Whether Studiomaster/AudioTech Systems (dealer, contact visible on rack stickers) will provide the **RS232/RS485 protocol document** for the Vāk 40.s — command set, baud rate, whether it reports per-unit mic-open/close events in real time or only static status.
- Whether the terminal block is genuinely RS485 (vs. GPIO/contact closure/camera control) — needs a multimeter/pinout check by a technician, not a photo.
- The exact number and identity mapping of delegate/chairman units purchased (17 seen "online"; U-shaped table photo suggests fewer physical gooseneck stands than 20 — possibly shared mics between adjacent seats).
- Whether the Vāk's "Record Out" / "Balanced Out" is physically accessible as a separate tap point *before* it enters the Orb 822 SC mixer, or whether AV has only ever routed it straight into that mixer (may need a Y-cable or a spare send).
- Whether the Orb 822 SC's "USB/Bluetooth" interface is 2-channel only (near-certain for this class of mixer) or supports more.
- Whether the AHUJA SSA-250M/AI-22 rack is actively in the current signal chain or legacy/unused equipment.
- Whether NOM (max 4) is configurable higher on this specific unit tier, and what mode (Discussion/Chairman/FIFO/LIFO) the university currently uses.
- Network/LAN availability at the rack location for a capture PC, and whether the existing interactive-display PC is suitable/available to double as (or connect to) the capture server.

None of this is guessable from photos — it needs a technician with the manual and 30–60 minutes of hands-on testing (checklist in Section 6 below).

---

## A. Understanding of the Problem

You want board meetings converted from "a recording nobody re-listens to" into a structured, speaker-attributed, evidence-grounded record: who said what, when, who challenged/supported whom, what was decided, who owns each action — with a human-approved official MoM at the end, built on infrastructure the university already owns.

## B. What's Technically Feasible

- Reliable single/dual-channel audio capture of the full meeting: **yes, straightforward.**
- Deterministic speaker attribution via serial mic-event metadata: **feasible, contingent on protocol access (UNVERIFIED).**
- Full 20-way discrete-channel speaker separation: **not feasible with current hardware** without replacing/augmenting it (see Section D).
- Local, cost-effective, Indian-English-capable STT: **yes** (faster-whisper).
- Deterministic overlap detection from timestamped mic events: **yes**, once serial metadata is available; otherwise must fall back to VAD-only overlap detection on a mixed stream, which is weaker.
- Hybrid rule-based + LLM discussion classification (PROPOSAL/SUPPORT/QUESTION/DECISION etc.): **yes**, well-suited to a small local or API LLM with structured-output prompting.
- Evidence-grounded, human-verified MoM generation with audit trail: **yes**, this is standard workflow engineering, not a research problem.
- Fully offline/local operation: **yes for audio+STT+DB**; LLM step can be local (7B–14B class) or a metered API call per meeting — your choice, discussed in Section 27.

## C. Assumptions Still Unverified (consolidated)

1. RS232/RS485 protocol availability and documentation for Vāk 40.s (**critical — blocks Plan A entirely if unavailable**).
2. Physical tap point for clean master audio before downstream mixing.
3. Exact unit-to-seat-to-person mapping process supported by the Vāk system's own configuration (it clearly supports unit IDs — does it support naming them?).
4. Server/network availability in the boardroom.
5. Whether the university will permit a dedicated capture PC/mini-server bolted into this rack, or whether the existing display PC must be reused.
6. Legal/policy stance on recording board meetings generally (consent, retention period) — this is a university governance question, not a technical one, but it gates deployment.

## D. What I Would Change in Your Proposed Architecture

| Your proposal | Issue | Revision |
|---|---|---|
| Channel-per-mic as *primary* speaker ID, diarization as backup | Hardware doesn't expose discrete channels | **Serial mic-event metadata as primary** (if protocol accessible), **diarization as primary fallback / disambiguator during overlap** — promote diarization from "backup" to "core component," not optional |
| "20-channel audio → VAD → STT" pipeline running 20× in parallel | There is no 20-channel audio to process | Single (or dual, if a redundant tap is added) audio stream → VAD → STT; overlap handling via serial events, not per-channel timestamp comparison |
| Parallel-speech detection via channel-interval overlap | No independent channel intervals exist | Overlap detection via **serial mic-ON/OFF event windows** (if available) or **secondary VAD energy/pitch cues + diarization** on the single stream (fallback) |
| Full 42-section production system as one build | Reasonable as a spec, risky as a build order | Confirmed by your own Section 25 — phased approach is right; Phase 0 must now explicitly gate on the RS232 question, not proceed assuming channels exist |
| pyannote.audio evaluated as "maybe unnecessary" | Under Plan A it's a nice-to-have; under Plan B/C (realistic) it's **required** to handle NOM-up-to-4 overlap and to survive a "protocol not available" outcome | Budget for it from day one; don't treat it as an optional add-on |
| Dante/AES67/USB-multichannel discovery checklist | Not applicable to this hardware — spec confirms single master out | Replace with a Vāk-specific discovery checklist (Section 6) |

Nothing else in your spec needs structural change — the STT/VAD choices, DB schema direction, MoM workflow, RBAC model, and phased rollout are all sound and are kept largely as you proposed, refined below.

## E. Recommended Architecture (Three Contingency Plans)

Because the RS232 question is unresolved, design for three outcomes rather than betting the whole build on one:

**Plan A — Serial metadata confirmed (best case).**
Vāk 40.s reports per-unit mic ON/OFF events with timestamps over RS232/RS485. Capture PC reads this via a USB-to-serial adapter in parallel with a single audio tap. Speaker attribution = event-timestamp lookup (deterministic, cheap, explainable). Diarization runs only as a QA/confidence check on segments where NOM > 1 (overlap window from the event stream itself).

**Plan B — Serial metadata partial or noisy (likely case).**
Protocol exists but only exposes coarse status (e.g., "mic X on" but not push-to-talk edges, or polling-only, not event-driven). Combine serial polling (sampled every ~200ms) with lightweight diarization to sharpen segment boundaries and disambiguate during overlaps. This is the realistic middle ground — **recommended design target.**

**Plan C — No usable serial access (worst case).**
Fall back entirely to diarization (pyannote.audio) on the single mixed audio stream, bootstrapped with short voice-enrollment samples per board member captured at meeting sign-in (30 seconds each, one-time or per-term). Speaker ID becomes probabilistic, confidence-scored, and always reviewable/correctable by a human — exactly the "confidence levels + human correction" model you already specified in Section 24.

All three plans share the same downstream pipeline (STT → intelligence → MoM) and the same DB schema — only the "who is speaking" module differs. Build the interface between them as a pluggable `speaker_attribution` service so Phase 0 discovery doesn't block starting Phase 1–2 work.

---

## F. Detailed Implementation Blueprint

### 1. Executive Summary
SBMIS turns the existing Vāk 40 boardroom system into an evidence-grounded meeting-intelligence platform: capture audio (single stream, tapped pre-downstream-mixing), attribute it to speakers via serial mic-metadata (primary) and diarization (disambiguator/fallback), transcribe with faster-whisper, classify discussion moves with a hybrid rule+LLM layer, extract decisions/actions with mandatory transcript-segment evidence links, and route everything through a human-approval workflow before anything becomes an official MoM. Runs on university-owned Linux infrastructure, local-first, ₹0 software licensing, modest hardware.

### 2. Problem Definition
Recorded-but-undocumented board meetings create no searchable record of accountability: who proposed what, who agreed, what was decided, who owns follow-up. Manual minute-taking is slow, incomplete, and not evidence-linked.

### 3. Proposed Solution
A pipeline: Audio capture → speaker attribution → STT → discussion structuring → decision/action extraction → human-reviewed MoM, with every extracted claim linked back to a timestamped transcript segment (and the original audio) for verification.

### 4. Why the Existing Infrastructure Is Still Valuable
Even without discrete channels, the Vāk system already solves: RF mic reliability, echo-free pickup (proper gooseneck condenser mics beat any DIY mic array), digital voting/sign-in (attendance data source!), and possibly camera tracking (useful for a future video-record feature). You are not starting from bare audio — you're starting from a purpose-built conferencing system; you just need to tap it correctly.

### 5. Assumptions vs. Verified
Already covered exhaustively in Section 0/C above — do not duplicate; refer back.

### 6. Infrastructure Discovery Plan (Vāk-specific, replaces generic Dante/AES67 checklist)

**Documents to obtain from AudioTech Systems (dealer) or Studiomaster directly:**
- Vāk 40.s RS232/RS485 protocol/command reference
- Confirmation of exact model/firmware version and unit count purchased
- Wiring diagram for delegate-unit daisy chain and master controller I/O

**Physical tests for the AV technician (in order):**
1. With only 1 delegate unit powered on, mute all others; observe whether touchscreen "Control" tab shows a live per-unit status list (not just a total count).
2. Connect a laptop to each RS232 port with a terminal program (115200/9600 8N1, try both) and press a delegate mic's talk button; watch for any bytes on the wire. This alone answers the single biggest open question in under an hour.
3. Identify the terminal block pinout with a multimeter (continuity to delegate-chain cable) to confirm RS485 vs. GPIO vs. camera control — do not assume from the label.
4. Trace the cable currently plugged into "Balanced Out"/"Mixer Out" to confirm it terminates at the Orb 822 SC channel 1 ("Conference MIC") input, and check whether a second free send (AUX, Record Out RCA) is available for an independent capture tap.
5. Plug a laptop into the Vāk's USB port and check whether it enumerates as a USB audio class device (unlikely — spec suggests USB is for the internal MP3 recorder only, not host audio) or only as mass storage.
6. Check the Orb 822 SC "USB/Bluetooth" interface: does the host PC see it as a 2-in/2-out stereo audio device? (Near-certain yes, but confirm channel count and whether Windows Sound settings show anything beyond stereo.)
7. Confirm current NOM setting and operating mode (Discussion/Chairman/FIFO/LIFO) via the "Setup" tab.
8. Confirm whether the existing room PC (with OBS/PTZ/Zoom) is available for reuse, or whether IT will provision a separate mini-server.
9. Confirm LAN drop/Wi-Fi availability at the rack for network access and updates.
10. Photograph/document the AHUJA SSA-250M+AI-22 signal path to determine if it's live or legacy.

### 7. End-to-End Architecture (Plan B, the recommended default)

```
[Vāk 40.s Balanced/Record Out] --analog--> [USB audio interface] --> Capture PC
[Vāk 40.s RS232/RS485 port]    --serial--> [USB-serial adapter]  --> Capture PC
                                                                        |
                                                     [VAD: Silero] -> speech segments
                                                                        |
                                         [faster-whisper STT, chunked/streaming]
                                                                        |
                        [Speaker attribution: serial-event lookup + diarization disambiguation]
                                                                        |
                                            [Timestamped, speaker-tagged transcript]
                                                     /              \
                                        [Live WebSocket to dashboard]  [Postgres persistence]
                                                                        |
                                    [Post-meeting: hybrid rule+LLM discussion structuring]
                                                                        |
                        [Decision/Action extraction, evidence-linked to transcript segments]
                                                                        |
                                         [Draft MoM -> Human review/edit -> Approve -> Final MoM PDF]
```

### 8. Audio Architecture
- Single analog tap (balanced line-level) from Vāk Record/Balanced Out → cheap USB audio interface (e.g., Behringer UCA202/Focusrite Scarlett Solo, ₹2,500–6,000) → 48kHz/24-bit WAV recorded continuously per meeting.
- If a second independent tap point can be found (e.g., an unused AUX send), record it as a redundant safety channel — cheap insurance against a single cable/interface failure.
- Do **not** attempt to build a 20-channel capture rig against hardware that doesn't support it — that would mean replacing the Vāk system entirely, which is out of scope and unjustified cost for a university pilot.
- FFmpeg for format handling; `sounddevice`/`soundfile` in Python for the capture daemon.

### 9. Speaker Identification Architecture
- **Primary (Plan A/B):** serial event stream from Vāk RS232/RS485, parsed by a small daemon into `(unit_id, event_type=ON/OFF, timestamp)` records, joined against a `microphone_unit → board_member` mapping table (configured per meeting in Participant Configuration).
- **Disambiguation/fallback (all plans):** pyannote.audio diarization on the single audio stream, used to (a) confirm/correct serial-based attribution when NOM > 1, and (b) be the sole speaker signal if serial access proves unavailable (Plan C). Each board member's voice is enrolled once (short calibrated sample) to allow supervised diarization (embedding matching) rather than blind clustering — much more reliable than unsupervised diarization for a small, closed group of ~20 known speakers.
- This design directly satisfies your Section 24 (confidence levels, human correction): every attributed segment carries a `confidence` and `attribution_source` (`serial` | `diarization` | `manual`) field.

### 10. Speech-to-Text Architecture
**Recommendation: faster-whisper**, `medium` or `large-v3` model depending on hardware, run in chunked/streaming mode on VAD-detected speech segments (not the whole stream at once).
- Why not plain Whisper: faster-whisper (CTranslate2 backend) is 2–4× faster on the same hardware, lower memory, same accuracy — direct drop-in improvement.
- Why not whisper.cpp: good for pure-CPU/edge deployment, but less mature Python integration for a FastAPI backend and worse batching; faster-whisper is the better fit given you'll want GPU later.
- Indian English: Whisper's multilingual training handles Indian-accented English reasonably; if accuracy is insufficient in pilot testing, fine-tuning or a specialized model swap is a Phase-14 optimization, not a Phase-1 blocker.
- Provides word-level timestamps and (with `--word_timestamps`) reasonable confidence proxies via log-probabilities — sufficient for your HIGH/MEDIUM/LOW confidence bands.
- CPU is viable for the prototype (2-channel PoC, non-real-time or near-real-time on a modern multi-core CPU with `medium` model); GPU (see Section 30) needed for real-time performance at full meeting length reliably.

### 11. VAD Architecture
**Recommendation: Silero VAD.** Lightweight (ONNX, runs comfortably on CPU), better accuracy than WebRTC VAD for boardroom-quality speech, trivial Python integration. Pipeline: continuous audio → Silero VAD → speech-segment boundaries → only those segments sent to faster-whisper. This alone cuts STT compute dramatically since board meetings have significant silence/pause time.

### 12. Parallel Speech Detection
- With a single mixed audio stream, you cannot literally separate two people's words the way independent channels would allow — be explicit with the university about this limitation.
- Detection mechanism: serial events give exact ON/OFF windows per unit; when two or more windows overlap, flag `PARALLEL_SPEECH_DETECTED` for that interval deterministically (this satisfies your "avoid LLM for something solvable deterministically" instruction well — it's pure interval-overlap logic once event data exists).
- For the overlapped interval, diarization attempts a best-effort split of the mixed audio into per-speaker text; both are shown to the reviewer, both linked to the *same* underlying audio for manual verification, and the segment is marked LOW CONFIDENCE by default. Do not attempt to present overlapped-speech transcripts as authoritative.
- If Plan C (no serial data), overlap detection degrades to diarization-only overlap heuristics (speaker-change/energy-based), which is noticeably weaker — another reason Plan A/B is worth pursuing hard in Phase 0.

### 13. Meeting Intelligence Architecture
Hybrid, as you specified:
- **Deterministic/rule-based:** sentence segmentation, speaker turn detection, keyword/pattern triggers (e.g., "I propose," "I support," "?" → question candidate), chronological linking of Q→R→Discussion→Decision by adjacency and speaker-reference.
- **AI/semantic (LLM):** classification into PROPOSAL/SUPPORT/QUESTION/RESPONSE/OBJECTION/SUGGESTION/DISCUSSION/DECISION/ACTION_ITEM/CONCLUSION where rules are ambiguous, and generating natural-language summaries — but always constrained to *classify or summarize given text*, never to invent content.
- Use a **local small LLM (7B–14B, quantized)** for classification in production to keep confidential board discussions off any external API; reserve an optional cloud LLM call only for the final MoM narrative drafting step if local model quality is insufficient, and only with explicit opt-in given confidentiality concerns (see Section 27).

### 14. Decision Extraction
Rule-assisted candidate detection (chairperson speaker + decisive phrasing patterns: "approved," "we will proceed," "the board decides") narrowed by LLM classification, each decision stored with a mandatory `evidence_segment_ids[]` foreign-key link — no decision record can exist without at least one linked transcript segment.

### 15. Action Item Extraction
Similar pattern: LLM extracts candidate `(action_text, responsible_person, deadline_if_mentioned)` tuples from RESPONSE/DECISION-classified segments; responsible person is cross-checked against the meeting's registered participant list (fuzzy match, not free text) to avoid inventing names; unmatched names are flagged for human resolution rather than silently accepted.

### 16. Attendance System
As you specified: never auto-conclude absence from mic inactivity alone. Combine three signals — (1) Vāk sign-in/voting keypad data (a genuine "I am present and logged in" action, strong signal), (2) mic-activity presence (weak signal, someone can attend without speaking), (3) manual confirmation by an authorized user (chair/secretary) before attendance is finalized. Statuses: PRESENT / ABSENT / NOT_CONFIRMED / LATE / LEFT_EARLY, with the mic/sign-in data shown as a *suggestion* the human confirms or overrides.

### 17. MoM Generation
Pipeline exactly as you specified (Section 12) — meeting details → attendees → agenda → discussion points → Q/R → proposals/suggestions/objections → decisions → action items/owners/deadlines → conclusion — assembled from the structured DB records (not re-generated from scratch by an LLM each time), with LLM used only to produce readable narrative prose around already-extracted, evidence-linked facts.

### 18. Human Verification Workflow
`AI Draft → Chairperson/Secretary Review & Edit → Approve → Sign → Final MoM`, with every field tagged `ai_generated` or `human_approved`/`human_edited`, and a full audit log (who changed what, when) — satisfies your non-negotiable requirement that AI never auto-publishes an official record.

**Digital sign-off (decided: simple in-app sign-off, not a legally-binding DSC/Aadhaar eSign).** Once the reviewer clicks Approve, the MoM content is hashed (SHA-256 of the final rendered content) and locked. Each required signatory (chairperson, secretary, and optionally attending board members per university policy) then:
1. Re-authenticates (re-enters their password — not just an already-open session — so the sign action is a deliberate, re-affirmed act, not an accidental click).
2. Clicks "Sign," which records `(user_id, meeting_minutes_id, content_hash, timestamp, ip_address)`.
3. Sees their name/designation and a "Digitally signed by X on [timestamp]" line rendered onto the final PDF.

**Integrity rule:** if the MoM content changes after any signature exists, all existing signatures on that version are invalidated (content_hash no longer matches) and must be re-collected — a signature is a statement about a specific, frozen version of the document, never about "the MoM in general." This is enforced at the DB layer, not just in the UI, so it can't be bypassed by a direct edit.

This is an internal audit-trailed attestation (who approved what, when, tamper-evident via the hash), not a legally-binding signature under the IT Act 2000 — worth stating plainly to the university so expectations are correct. If external legal enforceability is ever required later (e.g., minutes need to be produced in a regulatory/legal proceeding), that's a Phase-14+ upgrade to DSC/Aadhaar eSign, not a rebuild.

### 19. Anti-Hallucination Strategy
- Every decision/action/attendee record requires a non-null evidence link to real transcript segment(s); the UI lets a reviewer jump straight to that timestamp in text and audio.
- LLM prompts are structured-output (JSON schema) and constrained to extract *from provided text only*; no open-ended generation of facts not present in the transcript.
- Confidence scoring surfaces uncertain extractions for mandatory human review rather than auto-publishing them.
- Names/roles are validated against the registered participant list, not free-generated.

### 19b. Elastic Device Count (mics added, removed, or swapped over time)

Design requirement: `n` (mics/units actually in use) should never be hardcoded anywhere — the system must keep working correctly whether the room has 6 units next meeting or 22 next year, without a code change or redeployment. This touches four layers:

1. **Database:** already covered above — `microphone_units` is a soft-deletable inventory table, `meeting_participant_mapping` is per-meeting, nothing assumes a fixed count (no `mic_1`...`mic_20` columns anywhere, no arrays of fixed length).
2. **Vāk controller side:** adding a new delegate unit is a hardware/controller-side pairing action (per the Vāk manual, up to 200 units supported) — independent of SBMIS. SBMIS just needs a "sync/refresh unit list" action on the Participant Configuration screen that re-reads currently-online unit IDs from the controller (via the same RS232/RS485 link) and lets the admin register any new ones or retire missing ones. No SBMIS deployment needed for hardware changes.
3. **Speaker attribution:** the serial-event parser and the diarization enrollment step both operate on "whichever units/voices are registered for this meeting," looping over the mapping table rather than a fixed range — a 6-person meeting and an 18-person meeting run the identical code path.
4. **Diarization enrollment (Plan B/C):** voice enrollment is per-person, done once when a board member is first added (or re-done if their unit/mic changes), stored independently of meeting size — adding a new board member is "enroll one more voice," not "reconfigure the model."

One thing this does **not** cover automatically: if the university replaces the Vāk system entirely with a different make/model (rather than adding/removing units within the same system), that's a Section 6 discovery exercise again for the new hardware — the *architecture* tolerates count changes, not vendor/protocol changes. Worth stating that distinction to stakeholders so "the system should handle more mics" isn't read as "the system is hardware-agnostic to any future mixer" — those are different guarantees.

### 20. Database Architecture
PostgreSQL, normalized. Key entities and relationships (refined from your list):

- `users` (system accounts, RBAC role)
- `board_members` (person master data — name, designation, department)
- `microphone_units` (Vāk delegate/chairman unit IDs — physical hardware, not people)
- `meeting_participant_mapping` (per-meeting: `board_member_id` ↔ `microphone_unit_id`, since mapping can change meeting to meeting)
- `meetings` (title, date, time, venue, type, status)
- `meeting_agendas` (per-meeting agenda items)
- `attendance` (`meeting_id`, `board_member_id`, `status`, `source` [device_signin/mic/manual], `confirmed_by`, `confirmed_at`)
- `audio_recordings` (one row per meeting per tap: file path, channel count, start/end time, checksum)
- `speech_segments` (start_ts, end_ts, `attribution_source`, `confidence`, `microphone_unit_id` nullable, `board_member_id` nullable pending confirmation, raw text, corrected text nullable)
- `discussion_classifications` (`segment_id` FK, `label` [PROPOSAL/SUPPORT/...], `confidence`, `model_version`)
- `discussion_links` (linking question→response→decision chains: `from_segment_id`, `to_segment_id`, `link_type`)
- `decisions` (`meeting_id`, text, `evidence_segment_ids[]`, status)
- `action_items` (`meeting_id`, text, `responsible_board_member_id`, `deadline` nullable, `evidence_segment_ids[]`, status)
- `meeting_minutes` (versioned: draft/reviewed/approved, `approved_by`, `approved_at`, `content_hash`)
- `signatures` (`meeting_minutes_id` FK, `user_id`, `content_hash` [must match `meeting_minutes.content_hash` at sign time], `signed_at`, `ip_address` — a row per signatory; a content change after signing invalidates matching rows rather than deleting them, preserving the audit trail of "signed version X, which was later superseded")
- `audit_logs` (generic: `entity`, `entity_id`, `action`, `actor`, `timestamp`, `diff`)

**Note on `microphone_units`:** this table is a live hardware inventory, not a fixed 1–20 list baked into the schema or code. Fields: `unit_id` (matches the Vāk system's own unit numbering), `unit_type` (delegate/chairman), `status` (active/decommissioned/spare), `added_at`, `removed_at` nullable. Units are added or retired by inserting/soft-deleting rows — never hard-deleted, so past meetings' `meeting_participant_mapping` and `speech_segments` records keep referring to a valid (if now-decommissioned) unit. Nothing elsewhere in the schema assumes a fixed count.

Indexes on `(meeting_id, start_ts)` for segments (fast timeline queries), foreign keys everywhere with `ON DELETE RESTRICT` for anything evidentiary (never cascade-delete transcript evidence out from under an approved decision). Retention policy configurable per university data-governance rules (a governance decision, not a technical one — flag for university legal/IT sign-off).

### 21. Storage Architecture
MinIO (S3-compatible, self-hosted, ₹0 license) for audio + PDFs + large artifacts; Postgres for structured data; local filesystem acceptable for pilot phase before MinIO is introduced in Phase 12.

Estimated storage (single mixed-stream capture, since that's what the hardware supports — dramatically cheaper than a 20-channel assumption):
- WAV 48kHz/16-bit mono ≈ 5.5 MB/min ≈ 330 MB/hour; compressed FLAC ≈ 150–200 MB/hour.
- 1 hour: ~200 MB (FLAC) | 2 hours: ~400 MB | 4 hours: ~800 MB
- 100 meetings (avg 2h): ~40 GB audio + a few GB of transcripts/PDFs/DB — trivially fits on a single server SSD; no exotic storage needed. (Note: this estimate is an order of magnitude smaller than a true 20-channel design would have required — another reason confirming the real hardware situation matters.)

### 22. Frontend Architecture
React + Vite + TypeScript + Tailwind, pages as you listed (1–16), with two adjustments:
- "Participant/Microphone Mapping" page must map to **unit IDs**, not "channel numbers" (there are no channels).
- "System/Audio Channel Health" page should show: audio tap status (levels/silence detection), serial-link status (connected/last event received), STT pipeline queue depth, WebSocket connection status.

### 23. Backend Architecture
FastAPI, REST + WebSockets. For background work: **prefer a simple asyncio task queue for the prototype/pilot** rather than Celery+Redis — this is a single-room, single-meeting-at-a-time system; introducing a distributed task queue is over-engineering at this scale. Revisit Celery+Redis only if/when SBMIS expands to multiple simultaneous rooms/meetings (a real scalability trigger, not a default).

### 24. WebSocket/Real-Time Architecture
Event schema, extended from yours to reflect the real speaker-attribution design:
```json
{
  "meeting_id": "...",
  "microphone_unit_id": 7,
  "speaker_id": "...",
  "speaker_name": "Dr. ABC",
  "start_time": "...",
  "end_time": "...",
  "text": "...",
  "stt_confidence": 0.94,
  "attribution_source": "serial | diarization | manual",
  "attribution_confidence": 0.88,
  "overlap_flag": false
}
```
Reconnect strategy: client exponential backoff with a "resync" request that replays the last N seconds of missed segments from Postgres (source of truth), not just relying on the live socket. Buffering: server holds a short rolling buffer so a brief disconnect doesn't lose events. Failure recovery: if the STT/attribution pipeline itself crashes, raw audio recording continues independently (separate process) so nothing is lost even if intelligence processing must be replayed later.

### 25. Security Architecture
As you specified: RBAC with SUPER_ADMIN / ADMIN(HOD) / CHAIRPERSON / BOARD_MEMBER / VIEWER, HTTPS everywhere, hashed passwords (argon2/bcrypt), audit logs on every write to meeting/decision/action/minutes tables, meeting-level access control (a board member should generally only see meetings they were invited to unless ADMIN), encrypted at-rest storage for audio (given confidentiality of board discussions), session handling via short-lived JWT + refresh tokens, scheduled encrypted backups.

Suggested exact permission matrix:
| Action | SUPER_ADMIN | ADMIN/HOD | CHAIRPERSON | BOARD_MEMBER | VIEWER |
|---|---|---|---|---|---|
| Create meeting | ✓ | ✓ | ✓ | – | – |
| Configure mic mapping | ✓ | ✓ | – | – | – |
| View live transcript | ✓ | ✓ | ✓ | ✓ (own meetings) | – |
| Edit/correct transcript | ✓ | ✓ | ✓ | – | – |
| Approve final MoM | ✓ | ✓ | ✓ | – | – |
| View approved MoM | ✓ | ✓ | ✓ | ✓ | ✓ (assigned) |
| System/audio health | ✓ | ✓ | – | – | – |
| User management | ✓ | – | – | – | – |

### 26. Deployment Architecture
Docker Compose on Ubuntu Server + Nginx reverse proxy. Necessary containers: `frontend`, `backend`, `postgres`, `minio`, `audio-processor` (the STT/VAD/attribution daemon — kept separate from backend since it needs sustained access to the audio device/serial port), `nginx`. **Redis is not necessary at pilot scale** given the asyncio-over-Celery decision above — drop it unless/until real concurrency demands it.

### 27. AI Model Strategy / Cost Optimization (combined — your Sections 9/10/27 overlap heavily)
**Recommended: Hybrid, local-first.**
- Local: VAD (Silero), STT (faster-whisper), diarization (pyannote.audio), database, storage — all fully local, ₹0 API cost, meets your confidentiality requirement (board discussions never leave university infrastructure).
- Local LLM (7B–14B quantized, e.g. via Ollama/vLLM) for discussion classification and MoM narrative drafting — keeps the *entire* pipeline offline-capable, which directly matches your stated preference for local-first/LAN-only operation.
- Only consider a cloud LLM API as an **optional, explicitly-consented, non-default** upgrade path for higher-quality MoM prose generation, never for anything touching raw confidential transcript content by default. Given this is official board-meeting content, the privacy-safe recommendation is: **stay fully local.**
- Fully cloud-heavy (Option C in your Section 10) is not recommended for this use case at all — unjustified recurring cost and a genuine confidentiality risk for board-level discussions.

### 28. Open-Source Library Comparison (summary)
| Task | Recommended | Why |
|---|---|---|
| VAD | Silero VAD | Best accuracy/CPU tradeoff, simple API |
| STT | faster-whisper | 2-4x speed of Whisper, same accuracy, CT2 backend |
| Diarization | pyannote.audio | Best open-source option, supports speaker-embedding enrollment |
| Audio I/O | sounddevice + soundfile | Simple, reliable, good Python ergonomics |
| PDF generation | ReportLab (fine control) or WeasyPrint (HTML→PDF, faster to iterate) | Recommend WeasyPrint for MoM templates — easier to design/maintain as HTML/CSS |
| Object storage | MinIO | S3-compatible, self-hosted, ₹0 |
| Backend | FastAPI | Async-native, WebSocket support, good for this exact shape of system |

### 29. Failure Handling
| Failure | Behavior |
|---|---|
| Serial link drops | Attribution silently falls back to diarization-only for the affected interval; flagged in UI; raw audio unaffected |
| Audio interface disconnects | Alert immediately (this is the one truly unrecoverable failure — no audio, no meeting record); recording daemon should auto-retry reconnect |
| Server restarts mid-meeting | Recording process runs independently of the web backend; on backend restart, resumes processing from last committed segment |
| Whisper crashes | Raw audio keeps recording; STT queue retries/backfills once the worker restarts |
| Local LLM fails | Transcript and raw decision/action candidates (rule-based layer) remain available; only the semantic classification/narrative layer degrades |
| Storage fills | Pre-emptive disk-usage alerting well before full; MinIO/Postgres should never be allowed to hit 100% silently |
| Simultaneous speech (up to NOM=4) | Handled per Section 12 — flagged, both/all candidate transcripts preserved, audio remains authoritative |
| Someone speaks very softly | VAD/STT confidence drops, segment marked LOW CONFIDENCE, reviewer prompted |
| Mapping wrong / person changes seat | Manual correction UI updates `meeting_participant_mapping`; historical segments can be manually re-attributed by an authorized reviewer |
| 4+ hour meeting | Chunked streaming STT processes incrementally, not as one giant post-hoc batch — no special handling needed beyond normal chunking |
| Power failure | UPS on the rack + capture PC recommended (cheap, high value for an official-record system) |

### 30. Data Accuracy
Three confidence bands (HIGH/MEDIUM/LOW) driven by combined STT log-probability + attribution confidence; every transcript segment, speaker tag, decision, and action item remains editable by an authorized reviewer; original audio always retrievable by timestamp for manual verification — exactly as you specified, unchanged.

### 31. Hardware Requirements
**A. Prototype (2-channel PoC, Phase 1-2):** any reasonably modern PC/laptop, 16GB RAM, no GPU required — faster-whisper `small`/`medium` on CPU is adequate for non-real-time testing.

**B. University pilot (single boardroom, real-time, Phase 3-9):** small server — 8-core CPU, 32GB RAM, 1TB SSD, **entry-level NVIDIA GPU (e.g., RTX 4060/A2000-class, 8-12GB VRAM)** recommended for real-time `medium`/`large-v3` transcription + diarization concurrently without lag. CPU-only real-time is *possible* with `small`/`medium` models but tight; GPU is the pragmatic choice once you want live transcript with low latency.

**C. Production (if scaled to multiple rooms):** revisit per-room GPU vs. a shared GPU server with queuing — not needed for a single-boardroom deployment; don't provision for this until there's a second room.

Do not buy anything beyond B for the university pilot — no justification for expensive hardware at this scale.

### 32. Scalability
Single-boardroom design scales fine as-is for years of PCU board meetings. If extended to multiple boardrooms/departments, the architecture generalizes cleanly (each room = its own audio tap + serial link + attribution config, same shared backend/DB) — no redesign needed, just more `audio-processor` instances.

### 33. Performance Expectations
With GPU (pilot spec): near-real-time transcript (a few seconds of lag per utterance) achievable. CPU-only: expect noticeably higher lag (tens of seconds), acceptable for the prototype phase but not ideal for a "live dashboard" experience — communicate this tradeoff to stakeholders early.

### 34. Testing Strategy
- Unit tests for deterministic logic (overlap detection, evidence-linking, attendance-status rules) — these are pure functions, test them thoroughly since they're your anti-hallucination backbone.
- Integration tests replaying recorded sample meeting audio + serial logs through the full pipeline.
- A structured **accuracy audit process**: after each pilot meeting, have a human compare AI draft vs. actual recording and log error categories (STT errors, misattribution, missed decisions) to track improvement over phases.

### 35. MVP Roadmap / 36. Phase-by-Phase Plan
Your phased plan (Section 25) is fundamentally right; one change — **Phase 0 must explicitly resolve the RS232/Plan A/B/C question before Phase 2 ("Speaker/channel mapping") can be meaningfully designed**, since the mapping mechanism itself depends on the answer:

- **Phase 0:** Infrastructure discovery (Section 6 checklist) — determines Plan A/B/C.
- **Phase 1:** Single-stream audio capture + VAD + faster-whisper PoC (no speaker ID yet) — validates STT quality on real boardroom acoustics/accents.
- **Phase 2:** Speaker attribution PoC per the confirmed plan (serial-event parsing, or diarization+enrollment).
- **Phase 3:** Full pipeline for one real meeting recording, offline processing, human review of output quality.
- **Phase 4:** Live dashboard + WebSocket real-time transcript.
- **Phase 5:** Overlap detection + confidence banding.
- **Phase 6:** Meeting intelligence (rule+LLM classification).
- **Phase 7:** Decision/action extraction with evidence linking.
- **Phase 8:** MoM generation (draft).
- **Phase 9:** Human approval workflow + audit trail.
- **Phase 10:** Auth/RBAC/security hardening.
- **Phase 11:** Docker deployment.
- **Phase 12:** Real boardroom pilot (shadow-run alongside normal minute-taking, compare).
- **Phase 13:** Performance optimization / GPU tuning.
- **Phase 14:** Formal handover, documentation, retention-policy sign-off with university governance.

### 37. Team Division
Suggest 4 tracks matching your listed expertise areas: (1) Audio/signal + hardware-integration engineer (owns Phase 0-2, the highest-risk area), (2) Backend/AI engineer (STT/VAD/intelligence pipeline), (3) Frontend engineer (dashboard), (4) DevOps (deployment, security, backups) — with the audio/hardware track starting immediately and gating the others' speaker-ID-dependent work, while backend/frontend can build the non-speaker-dependent scaffolding (meeting CRUD, DB schema, MoM templates) in parallel.

### 38. Demo Plan
A short (10-15 min), pre-scripted mock board discussion with 3-4 participants using real delegate units, showing: live transcript appearing, a deliberate overlap moment (two people pressing talk together) correctly flagged, one clear decision statement correctly extracted with evidence link, and a reviewer editing/approving a MoM live.

### 39. Pilot Deployment Plan
Run SBMIS in shadow mode alongside the existing manual minute-taking process for 2-3 real board meetings before treating its output as authoritative for anything; compare AI draft to human-written minutes; only after acceptable accuracy should the university consider it a primary tool (with human approval always retained regardless).

### 40. Risks and Mitigations
| Risk | Mitigation |
|---|---|
| RS232 protocol undocumented/inaccessible | Plan C fallback (diarization-only) designed in from day one, not a late patch |
| STT accuracy on Indian-accented English insufficient | Budget time in Phase 1 specifically to evaluate on real recorded samples before committing further phases |
| University confidentiality concerns about AI processing board discussions | Fully local architecture addresses this directly; document data flow clearly for stakeholder sign-off |
| Scope creep toward "Whisper + ChatGPT + PDF" | Evidence-linking and deterministic-first design (this document) is the differentiator; keep it enforced in code review, not just in the spec |
| Hardware physically can't support what's promised | This document already de-risks that by confirming actual capability up front, rather than discovering it mid-build |

### 41. Final Recommended Architecture
Local-first, single-mixed-audio-stream capture tapped directly from the Vāk 40.s master output, serial mic-event metadata as primary speaker attribution (degrading gracefully to enrolled-voice diarization), faster-whisper + Silero VAD for transcription, hybrid rule+local-LLM discussion intelligence, evidence-grounded decision/action extraction, mandatory human review before any official MoM, PostgreSQL + MinIO on a single modest GPU-equipped server, Docker Compose deployment, RBAC-secured, fully capable of running entirely offline on the university LAN.

### 42. Exact Next Steps
1. Get the Vāk 40.s RS232/RS485 protocol documentation from AudioTech Systems/Studiomaster — this single item determines which of Plan A/B/C you're building. Do this **this week**, before writing any pipeline code.
2. Run the Section 6 physical-test checklist with an AV technician.
3. Stand up the Phase 1 PoC (single-stream capture + VAD + faster-whisper) in parallel — it doesn't depend on the RS232 answer and de-risks your STT-quality assumption early.
4. Once Plan A/B/C is confirmed, build the speaker-attribution module as a pluggable service per Section E, and proceed through the phased roadmap in Section 35/36.

---
*End of blueprint. Treat this as the master technical specification; application code should not begin until Phase 0 discovery (Section 6) is complete and the operative plan (A/B/C) is confirmed.*
