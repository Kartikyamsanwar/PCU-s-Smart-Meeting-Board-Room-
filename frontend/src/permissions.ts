// Mirrors the RBAC permission matrix in Blueprint Section F.25 exactly.
import type { Role } from "./types";

export type Action =
  | "create_meeting"
  | "configure_mic_mapping"
  | "view_live_transcript"
  | "edit_transcript"
  | "approve_mom"
  | "view_approved_mom"
  | "system_health"
  | "user_management";

const MATRIX: Record<Action, Role[]> = {
  create_meeting: ["SUPER_ADMIN", "ADMIN", "CHAIRPERSON"],
  configure_mic_mapping: ["SUPER_ADMIN", "ADMIN"],
  view_live_transcript: ["SUPER_ADMIN", "ADMIN", "CHAIRPERSON", "BOARD_MEMBER"],
  edit_transcript: ["SUPER_ADMIN", "ADMIN", "CHAIRPERSON"],
  approve_mom: ["SUPER_ADMIN", "ADMIN", "CHAIRPERSON"],
  view_approved_mom: ["SUPER_ADMIN", "ADMIN", "CHAIRPERSON", "BOARD_MEMBER", "VIEWER"],
  system_health: ["SUPER_ADMIN", "ADMIN"],
  user_management: ["SUPER_ADMIN"],
};

export function can(role: Role | undefined, action: Action): boolean {
  if (!role) return false;
  return MATRIX[action].includes(role);
}

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin / HOD",
  CHAIRPERSON: "Chairperson",
  BOARD_MEMBER: "Board Member",
  VIEWER: "Viewer",
};
