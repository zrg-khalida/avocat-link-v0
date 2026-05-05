import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, BellOff, Volume2, VolumeX, Monitor, Settings as Cog } from "lucide-react";
import { useNotifSettings, CHANNEL_META, isMutedNow, type NotifChannel } from "@/lib/notif-settings";
import { RoleGuard } from "@/components/RoleGuard";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — Avocat-Link" },
      { name: "description", content: "Manage notification channels and mute rules." },
    ],
  }),
});

const QUICK_MUTE = [
  { label: "15 min", ms: 15 * 60 * 1000 },
  { label: "1 hour", ms: 60 * 60 * 1000 },
  { label: "Until tomorrow", ms: 12 * 60 * 60 * 1000 },
];

function SettingsPage() {
  return (
    <RoleGuard action="view:settings">
      <SettingsInner />
    </RoleGuard>
  );
}

function SettingsInner() {
  const s = useNotifSettings();
  const [, setTick] = useState(0);

  // Refresh "mute until" countdown every 30s
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const muted = isMutedNow(s);
  const muteLabel = muted && s.muteUntil
    ? `Muted until ${new Date(s.muteUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "Notifications active";

  return (
    <div className="mx-auto max-w-3xl px-6 pt-8 pb-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 rounded-full chip-emerald px-3 py-1 text-xs font-semibold">
          <Cog className="h-3 w-3" /> Settings
        </div>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Notifications</h1>
        <p className="mt-2 text-muted-foreground">
          Choose what surfaces in your bell, and silence the rest.
        </p>
      </motion.div>

      {/* Mute card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="surface-lg rounded-2xl p-6 mt-8"
        data-testid="mute-card"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${muted ? "chip-rose" : "chip-emerald"}`}>
              {muted ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
            </div>
            <div>
              <div className="font-semibold text-sm">{muteLabel}</div>
              <div className="text-xs text-muted-foreground">Quick mute pauses every channel for the chosen window.</div>
            </div>
          </div>
          {muted && (
            <button
              onClick={() => s.setMute(null)}
              className="rounded-lg surface px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
            >
              Unmute now
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_MUTE.map((q) => (
            <button
              key={q.label}
              onClick={() => s.setMute(Date.now() + q.ms)}
              className="rounded-lg surface px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
            >
              Mute {q.label}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Channels */}
      <motion.section
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="surface-lg rounded-2xl mt-6 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border">
          <div className="font-semibold">Notification types</div>
          <div className="text-xs text-muted-foreground">Toggle the categories you want to receive.</div>
        </div>
        <div className="divide-y divide-border">
          {(Object.keys(CHANNEL_META) as NotifChannel[]).map((c) => {
            const meta = CHANNEL_META[c];
            const on = s.enabled[c];
            return (
              <div key={c} className="flex items-center justify-between gap-4 px-6 py-4" data-testid={`channel-${c}`}>
                <div>
                  <div className="text-sm font-semibold">{meta.label}</div>
                  <div className="text-xs text-muted-foreground">{meta.hint}</div>
                </div>
                <button
                  role="switch"
                  aria-checked={on}
                  aria-label={`Toggle ${meta.label}`}
                  onClick={() => s.toggle(c)}
                  className={`relative h-6 w-11 rounded-full transition ${on ? "bg-primary glow-primary" : "bg-secondary"}`}
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 480, damping: 30 }}
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-card shadow"
                    style={{ left: on ? "calc(100% - 22px)" : "2px" }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Delivery */}
      <motion.section
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="surface-lg rounded-2xl mt-6 p-6"
      >
        <div className="font-semibold mb-4">Delivery</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => s.setDesktop(!s.desktop)}
            className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm transition ${s.desktop ? "bg-primary/10 ring-1 ring-primary/30" : "surface"}`}
            data-testid="toggle-desktop"
          >
            <span className="inline-flex items-center gap-2"><Monitor className="h-4 w-4 text-primary" /> Desktop pop-ups</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider">{s.desktop ? "On" : "Off"}</span>
          </button>
          <button
            onClick={() => s.setSound(!s.sound)}
            className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm transition ${s.sound ? "bg-primary/10 ring-1 ring-primary/30" : "surface"}`}
            data-testid="toggle-sound"
          >
            <span className="inline-flex items-center gap-2">
              {s.sound ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
              Sound
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider">{s.sound ? "On" : "Off"}</span>
          </button>
        </div>
      </motion.section>
    </div>
  );
}
