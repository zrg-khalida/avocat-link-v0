import { create } from "zustand";
import { INITIAL_CONSULTATIONS, INITIAL_REQUESTS, type Consultation, type LawyerRequest } from "./mock-data";

export type Role = "client" | "lawyer";

export interface UserProfile {
  name: string;
  email: string;
  role: Role;
  // Lawyer-only
  specialty?: "Business" | "Penal" | "Family";
  barreau?: string;
}

interface AppState {
  user: UserProfile | null;
  consultations: Consultation[];
  requests: LawyerRequest[];
  setUser: (u: UserProfile | null) => void;
  addConsultation: (c: Omit<Consultation, "id" | "status">) => void;
  advance: (id: string) => void;
  decideRequest: (id: string, decision: "accepted" | "declined") => void;
}

export const useApp = create<AppState>((set) => ({
  user: { name: "Alex Mercier", email: "alex@avocat-link.io", role: "client" },
  consultations: INITIAL_CONSULTATIONS,
  requests: INITIAL_REQUESTS,
  setUser: (u) => set({ user: u }),
  addConsultation: (c) =>
    set((s) => ({
      consultations: [
        { ...c, id: crypto.randomUUID(), status: "Pending" },
        ...s.consultations,
      ],
    })),
  advance: (id) =>
    set((s) => ({
      consultations: s.consultations.map((c) => {
        if (c.id !== id) return c;
        const order: Consultation["status"][] = ["Pending", "Analyzing", "Confirmed"];
        const next = order[Math.min(order.length - 1, order.indexOf(c.status) + 1)];
        return { ...c, status: next };
      }),
    })),
  decideRequest: (id, decision) =>
    set((s) => ({
      requests: s.requests.map((r) => (r.id === id ? { ...r, status: decision } : r)),
    })),
}));
