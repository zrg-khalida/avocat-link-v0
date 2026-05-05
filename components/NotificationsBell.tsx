import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellOff, CheckCircle2, Clock4, Settings as Cog, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { CLIENT_NOTIFS, LAWYER_NOTIFS, toSemanticTone, type Notif } from "@/lib/notifications";
import { CHANNEL_META, isMutedNow, useNotifSettings, type NotifChannel } from "@/lib/notif-settings";

// Map seed notifs into channels for the prefs filter
function classify(n: Notif): NotifChannel {
  const t = `${n.title} ${n.body}`.toLowerCase();
  if (t.includes("payment") || t.includes("invoice") || t.includes("€")) return "billing";
  if (t.includes("vault") || t.includes("encrypted") || t.includes("sign")) return "security";
  if (t.includes("message") || t.includes("chat") || t.includes("reply")) return "messages";
  if (t.includes("booking") || t.includes("request") || t.includes("consultation") || t.includes("brief")) return "bookings";
  return "system";
}

export function NotificationsBell() {
  const role = useApp((s) => s.user?.role) ?? "client";
  const enabled = useNotifSettings((s) => s.enabled);
  const muteUntil = useNotifSettings((s) => s.muteUntil);
  const setMute = useNotifSettings((s) => s.setMute);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>(role === "lawyer" ? LAWYER_NOTIFS : CLIENT_NOTIFS);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(role === "lawyer" ? LAWYER_NOTIFS : CLIENT_NOTIFS);
  }, [role]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const muted = isMutedNow({ muteUntil });

  const visible = useMemo(
    () => items.filter((n) => enabled[classify(n)]),
    [items, enabled]
  );

  const unread = muted ? 0 : visible.filter((i) => i.unread).length;

  const markAll = () => setItems((prev) => prev.map((i) => ({ ...i, unread: false })));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        data-magnetic
        data-testid="notif-bell"
        className="relative grid h-10 w-10 place-items-center rounded-xl surface hover:bg-secondary transition"
        aria-label={muted ? "Notifications (muted)" : "Notifications"}
      >
        {muted ? (
          <BellOff className="h-4.5 w-4.5 text-muted-foreground" strokeWidth={2.2} />
        ) : (
          <Bell className="h-4.5 w-4.5 text-accent" strokeWidth={2.2} />
        )}
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground glow-primary"
            data-testid="notif-unread-count"
          >
            {unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="absolute right-0 mt-3 w-[360px] glass-strong rounded-2xl overflow-hidden z-50"
            data-testid="notif-dropdown"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="font-display text-base">Notifications</div>
              <div className="flex items-center gap-2">
                <button onClick={markAll} className="text-[11px] text-primary hover:underline">Mark all read</button>
                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="grid h-7 w-7 place-items-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                  aria-label="Notification settings"
                  data-testid="notif-settings-link"
                >
                  <Cog className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Quick mute strip */}
            <div className="px-4 py-2 border-b border-border/60 flex items-center justify-between gap-2 bg-secondary/30">
              <div className="text-[11px] text-muted-foreground">
                {muted && muteUntil
                  ? `Muted · resumes ${new Date(muteUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Quick mute"}
              </div>
              <div className="flex items-center gap-1">
                {muted ? (
                  <button
                    onClick={() => setMute(null)}
                    className="rounded-md surface px-2 py-0.5 text-[10px] font-semibold hover:bg-secondary"
                  >
                    Unmute
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setMute(Date.now() + 15 * 60_000)}
                      className="rounded-md surface px-2 py-0.5 text-[10px] font-semibold hover:bg-secondary"
                    >
                      15m
                    </button>
                    <button
                      onClick={() => setMute(Date.now() + 60 * 60_000)}
                      className="rounded-md surface px-2 py-0.5 text-[10px] font-semibold hover:bg-secondary"
                    >
                      1h
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {visible.map((n, idx) => {
                const semantic = toSemanticTone(n.tone);
                const Icon = semantic === "success" ? CheckCircle2 : semantic === "danger" ? XCircle : Clock4;
                const chip = `chip-${semantic}`;
                const channel = classify(n);
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`flex gap-3 px-4 py-3 border-b border-border/60 ${n.unread && !muted ? "bg-secondary/40" : ""}`}
                    data-testid="notif-item"
                  >
                    <div className={`grid h-8 w-8 place-items-center rounded-lg ${chip}`}>
                      <Icon className={`h-4 w-4 ${semantic === "success" ? "text-accent" : ""}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold truncate">{n.title}</div>
                        {n.unread && !muted && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-[10px] text-muted-foreground">{n.time}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{CHANNEL_META[channel].label}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {visible.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-10">
                  {items.length > 0 ? "All categories are off — adjust in Settings." : "All caught up."}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
