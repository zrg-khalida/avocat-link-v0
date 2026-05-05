/**
 * Tone tokens are semantic. The legacy names (emerald/amber/rose) are kept as
 * aliases so existing data can stay untouched while components reason in terms
 * of success/warning/danger. Both forms render with the monochromatic legal palette.
 */
export type SemanticTone = "success" | "warning" | "danger";
export type LegacyTone = "emerald" | "amber" | "rose";
export type NotifTone = SemanticTone | LegacyTone;

const TONE_ALIAS: Record<NotifTone, SemanticTone> = {
  emerald: "success",
  amber: "warning",
  rose: "danger",
  success: "success",
  warning: "warning",
  danger: "danger",
};

export function toSemanticTone(t: NotifTone): SemanticTone {
  return TONE_ALIAS[t];
}

export interface Notif {
  id: string;
  title: string;
  body: string;
  tone: NotifTone;
  time: string;
  unread: boolean;
}

export const CLIENT_NOTIFS: Notif[] = [
  { id: "n1", title: "Brief under analysis", body: "Counsel Renard is reviewing your custody brief.", tone: "amber", time: "2 min ago", unread: true },
  { id: "n2", title: "Booking confirmed", body: "Consultation with Amelia Laurent on Apr 28 at 10:00.", tone: "emerald", time: "1 h ago", unread: true },
  { id: "n3", title: "Document encrypted", body: "NDA_Acquisition_v3.pdf was sealed in your vault.", tone: "emerald", time: "Yesterday", unread: false },
];

export const LAWYER_NOTIFS: Notif[] = [
  { id: "n1", title: "New request", body: "Camille Roux submitted a shareholder dispute brief.", tone: "amber", time: "5 min ago", unread: true },
  { id: "n2", title: "Payment received", body: "€3,100 settled for Yasmine Cohen — series B advisory.", tone: "emerald", time: "2 h ago", unread: true },
  { id: "n3", title: "Request declined", body: "You declined the appeal from Étienne Fabre.", tone: "rose", time: "Yesterday", unread: false },
];

export interface ChatThread {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  time: string;
  online: boolean;
  unread: number;
}

export interface ChatMessage {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

export const CLIENT_THREADS: ChatThread[] = [
  { id: "t1", name: "Counsel Amelia Laurent", initials: "AL", lastMessage: "I'll review the NDA tonight.", time: "10:42", online: true, unread: 2 },
  { id: "t2", name: "Counsel Sofia Renard",   initials: "SR", lastMessage: "We can mediate next week.",   time: "Yesterday", online: false, unread: 0 },
  { id: "t3", name: "Counsel Inès Vautrin",   initials: "IV", lastMessage: "Sending the draft now.",      time: "Mon",       online: true,  unread: 0 },
];

export const LAWYER_THREADS: ChatThread[] = [
  { id: "t1", name: "Camille Roux",   initials: "CR", lastMessage: "Could you take this case?",   time: "10:42",      online: true,  unread: 3 },
  { id: "t2", name: "Yasmine Cohen",  initials: "YC", lastMessage: "Thanks, transferred today.",  time: "Yesterday",  online: false, unread: 0 },
  { id: "t3", name: "Nadia Brahimi",  initials: "NB", lastMessage: "Awaiting court order copy.",  time: "Mon",        online: true,  unread: 1 },
];

export const SAMPLE_THREAD: ChatMessage[] = [
  { id: "m1", from: "them", text: "Hello Counsel, I just uploaded the latest version of the brief.", time: "10:31" },
  { id: "m2", from: "me",   text: "Received — I'll go through it this afternoon and revert with a redline.", time: "10:33" },
  { id: "m3", from: "them", text: "Perfect. Anything I should prepare on my side?", time: "10:34" },
  { id: "m4", from: "me",   text: "Just the prior correspondence with the counterparty if you have it.", time: "10:36" },
  { id: "m5", from: "them", text: "Will send those over right away.", time: "10:41" },
];
