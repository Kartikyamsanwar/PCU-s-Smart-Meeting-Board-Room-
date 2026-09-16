// Shapes mirror the Blueprint's DB schema (Section F.20) field-for-field,
// so wiring this UI to the real FastAPI backend later is a data-source swap,
// not a redesign.

export type Role = "SUPER_ADMIN" | "ADMIN" | "CHAIRPERSON" | "BOARD_MEMBER" | "VIEWER";

export interface User {
  id: string;
  name: string;
  designation: string;
  role: Role;
}

export interface BoardMember {
  id: string;
  name: string;
  designation: string;
  department: string;
}

export type UnitStatus = "active" | "decommissioned" | "spare";
export type UnitType = "delegate" | "chairman";

export interface MicrophoneUnit {
  unit_id: number;
  unit_type: UnitType;
  status: UnitStatus;
}

export interface ParticipantMapping {
  meeting_id: string;
  board_member_id: string;
  microphone_unit_id: number | null;
}

export type MeetingStatus = "scheduled" | "in_progress" | "completed" | "mom_approved";

export interface Meeting {
  id: string;
  title: string;
  date: string; // ISO date
  time: string;
  venue: string;
  type: string;
  status: MeetingStatus;
}

export interface AgendaItem {
  meeting_id: string;
  order: number;
  text: string;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "NOT_CONFIRMED" | "LATE" | "LEFT_EARLY";
export type AttendanceSource = "device_signin" | "mic" | "manual";

export interface Attendance {
  meeting_id: string;
  board_member_id: string;
  status: AttendanceStatus;
  source: AttendanceSource;
  confirmed_by: string | null;
}

export type AttributionSource = "serial" | "diarization" | "manual";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";

export interface SpeechSegment {
  id: string;
  meeting_id: string;
  start_ts: number; // seconds from meeting start
  end_ts: number;
  microphone_unit_id: number | null;
  board_member_id: string | null;
  speaker_name: string;
  text: string;
  attribution_source: AttributionSource;
  confidence: Confidence;
  overlap_flag: boolean;
}

export type DiscussionLabel =
  | "PROPOSAL" | "SUPPORT" | "QUESTION" | "RESPONSE" | "OBJECTION"
  | "SUGGESTION" | "DISCUSSION" | "DECISION" | "ACTION_ITEM" | "CONCLUSION";

export interface Decision {
  id: string;
  meeting_id: string;
  text: string;
  evidence_segment_ids: string[];
  status: "proposed" | "approved";
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  text: string;
  responsible_board_member_id: string;
  deadline: string | null;
  evidence_segment_ids: string[];
  status: "open" | "in_progress" | "done";
}

export type MinutesStatus = "draft" | "reviewed" | "approved";

export interface MeetingMinutes {
  meeting_id: string;
  status: MinutesStatus;
  approved_by: string | null;
  approved_at: string | null;
  content_hash: string | null;
}

export interface Signature {
  meeting_id: string;
  user_id: string;
  user_name: string;
  designation: string;
  signed_at: string;
}

export type ServiceState = "ok" | "degraded" | "down";

export interface SystemHealth {
  audio_tap: { state: ServiceState; detail: string };
  serial_link: { state: ServiceState; detail: string };
  stt_queue_depth: number;
  websocket: { state: ServiceState; detail: string };
}
