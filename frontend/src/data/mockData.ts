// Realistic sample data shaped exactly like the Blueprint's DB schema
// (Section F.20), so this UI can be pointed at a real FastAPI backend later
// by swapping the data source, not the components.
//
// This is a Phase 1/4 frontend scaffold: no backend exists yet (Phase 0-2
// are gated on the RS232 hardware discovery — Blueprint Section 6), so
// every page here reads from this file instead of a live API.

import type {
  ActionItem, Attendance, BoardMember, Decision, Meeting, MeetingMinutes,
  MicrophoneUnit, ParticipantMapping, Signature, SpeechSegment, SystemHealth, User,
} from "../types";

export const currentUsers: User[] = [
  { id: "u1", name: "Dr. Kavita Rao", designation: "Registrar", role: "SUPER_ADMIN" },
  { id: "u2", name: "Prof. Sanjay Iyer", designation: "HOD, Dept. of CSE", role: "ADMIN" },
  { id: "u3", name: "Dr. Meera Deshpande", designation: "Vice Chancellor", role: "CHAIRPERSON" },
  { id: "u4", name: "Prof. Arvind Nair", designation: "Dean, Student Affairs", role: "BOARD_MEMBER" },
  { id: "u5", name: "Guest Observer", designation: "External Auditor", role: "VIEWER" },
];

export const boardMembers: BoardMember[] = [
  { id: "bm1", name: "Dr. Meera Deshpande", designation: "Vice Chancellor", department: "Administration" },
  { id: "bm2", name: "Dr. Kavita Rao", designation: "Registrar", department: "Administration" },
  { id: "bm3", name: "Prof. Sanjay Iyer", designation: "HOD, CSE", department: "Computer Science" },
  { id: "bm4", name: "Prof. Arvind Nair", designation: "Dean, Student Affairs", department: "Student Affairs" },
  { id: "bm5", name: "Dr. Priya Krishnan", designation: "Finance Officer", department: "Finance" },
  { id: "bm6", name: "Prof. Lakshmi Menon", designation: "HOD, Mechanical", department: "Mechanical Engineering" },
  { id: "bm7", name: "Dr. Farhan Sheikh", designation: "Controller of Examinations", department: "Academics" },
  { id: "bm8", name: "Ms. Ananya Bose", designation: "Student Representative", department: "Student Council" },
];

export const microphoneUnits: MicrophoneUnit[] = Array.from({ length: 17 }, (_, i) => ({
  unit_id: i + 1,
  unit_type: i === 0 ? "chairman" : "delegate",
  status: "active",
}));

export const meetings: Meeting[] = [
  { id: "m1", title: "Board of Governors — Q3 Review", date: "2026-09-10", time: "10:00", venue: "Main Boardroom", type: "Quarterly Review", status: "completed" },
  { id: "m2", title: "Curriculum Revision Committee", date: "2026-09-17", time: "14:30", venue: "Main Boardroom", type: "Committee", status: "in_progress" },
  { id: "m3", title: "Annual Budget Approval", date: "2026-09-24", time: "11:00", venue: "Main Boardroom", type: "Finance", status: "scheduled" },
  { id: "m4", title: "Board of Governors — Q2 Review", date: "2026-06-12", time: "10:00", venue: "Main Boardroom", type: "Quarterly Review", status: "mom_approved" },
];

export const participantMappings: ParticipantMapping[] = [
  { meeting_id: "m1", board_member_id: "bm1", microphone_unit_id: 1 },
  { meeting_id: "m1", board_member_id: "bm2", microphone_unit_id: 2 },
  { meeting_id: "m1", board_member_id: "bm3", microphone_unit_id: 3 },
  { meeting_id: "m1", board_member_id: "bm4", microphone_unit_id: 4 },
  { meeting_id: "m1", board_member_id: "bm5", microphone_unit_id: 5 },
  { meeting_id: "m1", board_member_id: "bm6", microphone_unit_id: null },
  { meeting_id: "m1", board_member_id: "bm7", microphone_unit_id: 7 },
  { meeting_id: "m1", board_member_id: "bm8", microphone_unit_id: 8 },
];

export const attendance: Attendance[] = [
  { meeting_id: "m1", board_member_id: "bm1", status: "PRESENT", source: "device_signin", confirmed_by: "u1" },
  { meeting_id: "m1", board_member_id: "bm2", status: "PRESENT", source: "device_signin", confirmed_by: "u1" },
  { meeting_id: "m1", board_member_id: "bm3", status: "PRESENT", source: "mic", confirmed_by: "u1" },
  { meeting_id: "m1", board_member_id: "bm4", status: "PRESENT", source: "device_signin", confirmed_by: "u1" },
  { meeting_id: "m1", board_member_id: "bm5", status: "LATE", source: "manual", confirmed_by: "u1" },
  { meeting_id: "m1", board_member_id: "bm6", status: "ABSENT", source: "manual", confirmed_by: "u1" },
  { meeting_id: "m1", board_member_id: "bm7", status: "PRESENT", source: "device_signin", confirmed_by: "u1" },
  { meeting_id: "m1", board_member_id: "bm8", status: "NOT_CONFIRMED", source: "mic", confirmed_by: null },
];

export const speechSegments: SpeechSegment[] = [
  { id: "s1", meeting_id: "m1", start_ts: 4, end_ts: 21, microphone_unit_id: 1, board_member_id: "bm1", speaker_name: "Dr. Meera Deshpande", text: "Good morning everyone. Let's begin with the Q3 academic performance review. Registrar, could you present the summary?", attribution_source: "serial", confidence: "HIGH", overlap_flag: false },
  { id: "s2", meeting_id: "m1", start_ts: 22, end_ts: 58, microphone_unit_id: 2, board_member_id: "bm2", speaker_name: "Dr. Kavita Rao", text: "Thank you. Overall pass percentage improved to 87 percent this quarter, up from 81. The Computer Science department led with 94 percent, but Mechanical saw a dip to 76 percent that needs attention.", attribution_source: "serial", confidence: "HIGH", overlap_flag: false },
  { id: "s3", meeting_id: "m1", start_ts: 60, end_ts: 74, microphone_unit_id: 3, board_member_id: "bm3", speaker_name: "Prof. Sanjay Iyer", text: "I'd like to propose we allocate additional lab hours for the Mechanical department next semester to address that gap.", attribution_source: "serial", confidence: "HIGH", overlap_flag: false },
  { id: "s4", meeting_id: "m1", start_ts: 75, end_ts: 79, microphone_unit_id: 5, board_member_id: "bm5", speaker_name: "Dr. Priya Krishnan", text: "What would that cost against the current budget?", attribution_source: "serial", confidence: "MEDIUM", overlap_flag: false },
  { id: "s5", meeting_id: "m1", start_ts: 80, end_ts: 95, microphone_unit_id: 3, board_member_id: "bm3", speaker_name: "Prof. Sanjay Iyer", text: "Roughly four lakhs for extra lab technician hours and consumables — well within the discretionary allocation.", attribution_source: "serial", confidence: "HIGH", overlap_flag: false },
  { id: "s6", meeting_id: "m1", start_ts: 96, end_ts: 101, microphone_unit_id: null, board_member_id: null, speaker_name: "Unidentified (overlap)", text: "[two speakers overlapping — support voiced, exact wording unclear]", attribution_source: "diarization", confidence: "LOW", overlap_flag: true },
  { id: "s7", meeting_id: "m1", start_ts: 102, end_ts: 118, microphone_unit_id: 1, board_member_id: "bm1", speaker_name: "Dr. Meera Deshpande", text: "The board approves the additional lab-hour allocation for Mechanical Engineering, effective next semester.", attribution_source: "serial", confidence: "HIGH", overlap_flag: false },
  { id: "s8", meeting_id: "m1", start_ts: 119, end_ts: 140, microphone_unit_id: 7, board_member_id: "bm7", speaker_name: "Dr. Farhan Sheikh", text: "Moving on — examination scheduling for the November cycle. We need to finalize the revaluation window before the 30th.", attribution_source: "serial", confidence: "HIGH", overlap_flag: false },
  { id: "s9", meeting_id: "m1", start_ts: 141, end_ts: 152, microphone_unit_id: 4, board_member_id: "bm4", speaker_name: "Prof. Arvind Nair", text: "I'll coordinate with the examination cell and circulate the revaluation calendar by Friday.", attribution_source: "serial", confidence: "MEDIUM", overlap_flag: false },
];

export const decisions: Decision[] = [
  { id: "d1", meeting_id: "m1", text: "Allocate additional lab hours and a ₹4,00,000 budget line for the Mechanical Engineering department, effective next semester.", evidence_segment_ids: ["s3", "s5", "s7"], status: "approved" },
];

export const actionItems: ActionItem[] = [
  { id: "a1", meeting_id: "m1", text: "Circulate the November revaluation calendar to all departments.", responsible_board_member_id: "bm4", deadline: "2026-09-18", evidence_segment_ids: ["s9"], status: "open" },
  { id: "a2", meeting_id: "m1", text: "Prepare a detailed cost breakdown for the Mechanical lab-hour expansion.", responsible_board_member_id: "bm3", deadline: "2026-09-25", evidence_segment_ids: ["s5"], status: "in_progress" },
];

export const meetingMinutes: Record<string, MeetingMinutes> = {
  m1: { meeting_id: "m1", status: "reviewed", approved_by: null, approved_at: null, content_hash: null },
  m4: { meeting_id: "m4", status: "approved", approved_by: "Dr. Meera Deshpande", approved_at: "2026-06-14T09:12:00", content_hash: "8f3a1c9e2b7d4f60" },
};

export const signatures: Signature[] = [
  { meeting_id: "m4", user_id: "u3", user_name: "Dr. Meera Deshpande", designation: "Vice Chancellor (Chairperson)", signed_at: "2026-06-14T09:12:00" },
  { meeting_id: "m4", user_id: "u1", user_name: "Dr. Kavita Rao", designation: "Registrar (Secretary)", signed_at: "2026-06-14T09:15:00" },
];

export const systemHealth: SystemHealth = {
  audio_tap: { state: "ok", detail: "Balanced Out, -18 dBFS avg, no silence gaps" },
  serial_link: { state: "degraded", detail: "RS232 protocol unconfirmed — running diarization-only fallback (Plan C)" },
  stt_queue_depth: 0,
  websocket: { state: "ok", detail: "1 client connected" },
};

export function boardMemberName(id: string | null): string {
  if (!id) return "Unattributed";
  return boardMembers.find((m) => m.id === id)?.name ?? "Unknown";
}

const HONORIFICS = new Set(["Dr.", "Prof.", "Mr.", "Ms.", "Mrs."]);

export function firstName(fullName: string): string {
  const parts = fullName.split(" ");
  return parts.find((p) => !HONORIFICS.has(p)) ?? parts[0];
}
