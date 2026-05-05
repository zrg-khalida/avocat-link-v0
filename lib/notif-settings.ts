import { create } from "zustand";
import type { NotifTone } from "./notifications";

export type NotifChannel = "bookings" | "messages" | "billing" | "security" | "system";

export interface NotifPrefs {
  enabled: Record<NotifChannel, boolean>;
  muteUntil: number | null; // epoch ms
  desktop: boolean;
  sound: boolean;
}

interface NotifSettingsState extends NotifPrefs {
  toggle: (c: NotifChannel) => void;
  setMute: (ms: number | null) => void;
  setDesktop: (v: boolean) => void;
  setSound: (v: boolean) => void;
}

export const CHANNEL_META: Record<NotifChannel, { label: string; tone: NotifTone; hint: string }> = {
  bookings: { label: "Bookings", tone: "emerald", hint: "Confirmed, declined, rescheduled" },
  messages: { label: "Messages", tone: "amber", hint: "New chat threads & replies" },
  billing: { label: "Billing", tone: "emerald", hint: "Payments and invoices" },
  security: { label: "Security", tone: "rose", hint: "Vault access & sign-ins" },
  system: { label: "System", tone: "amber", hint: "Maintenance & product updates" },
};

export const useNotifSettings = create<NotifSettingsState>((set) => ({
  enabled: { bookings: true, messages: true, billing: true, security: true, system: false },
  muteUntil: null,
  desktop: false,
  sound: true,
  toggle: (c) => set((s) => ({ enabled: { ...s.enabled, [c]: !s.enabled[c] } })),
  setMute: (ms) => set({ muteUntil: ms }),
  setDesktop: (v) => set({ desktop: v }),
  setSound: (v) => set({ sound: v }),
}));

export function isMutedNow(prefs: Pick<NotifPrefs, "muteUntil">): boolean {
  return !!prefs.muteUntil && prefs.muteUntil > Date.now();
}
