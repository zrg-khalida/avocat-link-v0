import type { Role } from "./store";

/** What each role can do, used by guards and tests */
export type Action =
  | "view:directory"
  | "view:dashboard"
  | "view:workspace"
  | "view:audit"
  | "view:messages"
  | "view:settings"
  | "book:consultation"
  | "upload:brief"
  | "decide:request"
  | "unlock:vault"
  | "generate:invoice"
  | "advance:case";

const MATRIX: Record<Action, Role[]> = {
  "view:directory": ["client"],
  "view:dashboard": ["client"],
  "view:workspace": ["lawyer"],
  "view:audit": ["client", "lawyer"],
  "view:messages": ["client", "lawyer"],
  "view:settings": ["client", "lawyer"],
  "book:consultation": ["client"],
  "upload:brief": ["client"],
  "advance:case": ["client"],
  "decide:request": ["lawyer"],
  "unlock:vault": ["lawyer"],
  "generate:invoice": ["lawyer"],
};

export function can(role: Role | undefined | null, action: Action): boolean {
  if (!role) return false;
  return MATRIX[action]?.includes(role) ?? false;
}

/** Default landing per role */
export function homeFor(role: Role): string {
  return role === "lawyer" ? "/workspace" : "/directory";
}

/** Routes -> required action (for guard) */
export const ROUTE_GUARDS: Record<string, Action> = {
  "/dashboard": "view:dashboard",
  "/directory": "view:directory",
  "/workspace": "view:workspace",
  "/audit": "view:audit",
  "/messages": "view:messages",
  "/settings": "view:settings",
};
