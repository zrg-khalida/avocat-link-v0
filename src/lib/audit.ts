import { create } from "zustand";
import type { Role } from "./store";

export type AuditEventType =
  | "login"
  | "logout"
  | "role_switch"
  | "booking"
  | "upload"
  | "vault_unlock"
  | "invoice_generated"
  | "access_denied";

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  actor: string;       // user name
  role: Role | "anonymous";
  detail: string;
  at: string;          // ISO
}

interface AuditState {
  events: AuditEvent[];
  log: (e: Omit<AuditEvent, "id" | "at">) => void;
  clear: () => void;
}

const seed: AuditEvent[] = [
  {
    id: "seed-1",
    type: "login",
    actor: "Alex Mercier",
    role: "client",
    detail: "Initial session bootstrapped",
    at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
  },
];

export const useAudit = create<AuditState>((set) => ({
  events: seed,
  log: (e) =>
    set((s) => ({
      events: [
        { ...e, id: (globalThis.crypto?.randomUUID?.() ?? `a-${Date.now()}-${Math.random()}`), at: new Date().toISOString() },
        ...s.events,
      ].slice(0, 200),
    })),
  clear: () => set({ events: [] }),
}));

export const AUDIT_LABEL: Record<AuditEventType, string> = {
  login: "Sign in",
  logout: "Sign out",
  role_switch: "Role switch",
  booking: "Consultation booked",
  upload: "Document uploaded",
  vault_unlock: "Vault unlocked",
  invoice_generated: "Invoice generated",
  access_denied: "Access denied",
};
