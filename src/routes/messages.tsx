import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Paperclip, Search, ShieldCheck, Phone, Video, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyConsultations, initialsOf, type ConsultationRow } from "@/lib/supabase-data";
import { CLIENT_THREADS, LAWYER_THREADS, SAMPLE_THREAD, type ChatMessage } from "@/lib/notifications";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
});

interface Thread {
  id: string;            // consultation id (or fallback id)
  name: string;
  initials: string;
  lastMessage: string;
  time: string;
  online: boolean;
  unread: number;
  isReal: boolean;
}

function MessagesPage() {
  const role = useApp((s) => s.user?.role) ?? "client";
  const [uid, setUid] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load session + threads from real consultations
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!mounted) return;
      const id = u.user?.id ?? null;
      setUid(id);
      try {
        const consults = await fetchMyConsultations();
        if (!mounted) return;
        const real: Thread[] = consults.map((c: ConsultationRow) => {
          const peer = role === "lawyer" ? c.client : c.lawyer;
          const name = peer?.name || peer?.email || "Untitled case";
          return {
            id: c.id,
            name,
            initials: initialsOf(name),
            lastMessage: c.document_name,
            time: new Date(c.scheduled_at).toLocaleDateString([], { month: "short", day: "numeric" }),
            online: c.status === "Confirmed",
            unread: 0,
            isReal: true,
          };
        });
        const fallback: Thread[] = (role === "lawyer" ? LAWYER_THREADS : CLIENT_THREADS).map((t) => ({ ...t, isReal: false }));
        const all = real.length > 0 ? real : fallback;
        setThreads(all);
        setActiveId(all[0]?.id);
      } catch {
        const fallback: Thread[] = (role === "lawyer" ? LAWYER_THREADS : CLIENT_THREADS).map((t) => ({ ...t, isReal: false }));
        setThreads(fallback);
        setActiveId(fallback[0]?.id);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [role]);

  const active = useMemo(() => threads.find((t) => t.id === activeId), [threads, activeId]);

  // Load messages for active thread
  useEffect(() => {
    if (!active || !uid) return;
    let mounted = true;
    (async () => {
      if (active.isReal) {
        const { data, error } = await supabase
          .from("messages")
          .select("id,sender_id,body,created_at")
          .eq("consultation_id", active.id)
          .order("created_at", { ascending: true });
        if (!mounted) return;
        if (error || !data) {
          setMessages([]);
          return;
        }
        setMessages(
          data.map((m) => ({
            id: m.id,
            from: m.sender_id === uid ? "me" : "them",
            text: m.body,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          })),
        );
      } else {
        setMessages(SAMPLE_THREAD);
      }
    })();
    return () => { mounted = false; };
  }, [active, uid]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !active) return;
    const body = input.trim();
    setInput("");

    if (active.isReal && uid) {
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const optimistic: ChatMessage = { id: crypto.randomUUID(), from: "me", text: body, time };
      setMessages((m) => [...m, optimistic]);
      const { error } = await supabase.from("messages").insert({
        consultation_id: active.id,
        sender_id: uid,
        body,
      });
      if (error) {
        setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      }
    } else {
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((m) => [...m, { id: crypto.randomUUID(), from: "me", text: body, time }]);
      setTyping(true);
      setTimeout(() => {
        setMessages((m) => [...m, {
          id: crypto.randomUUID(), from: "them",
          text: "Noted — I'll incorporate that into the next draft.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
        setTyping(false);
      }, 1800);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 pt-8 pb-8">
      <div className="mb-6">
        <h1 className="font-display text-4xl">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground inline-flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          End-to-end encrypted · Messages are never stored in plaintext
        </p>
      </div>

      <div className="surface-lg rounded-3xl overflow-hidden grid md:grid-cols-[320px_1fr] h-[calc(100vh-220px)] min-h-[520px]">
        <aside className="border-r border-border flex flex-col bg-secondary/30">
          <div className="p-4">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-[oklch(0.94_0.008_250)] border border-border">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Search conversations…" className="flex-1 bg-transparent text-sm outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
            {loading && <div className="px-3 py-2 text-xs text-muted-foreground">Loading conversations…</div>}
            {!loading && threads.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">No conversations yet.</div>
            )}
            {threads.map((t) => {
              const isActive = t.id === activeId;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition ${
                    isActive ? "bg-card shadow-sm ring-1 ring-border" : "hover:bg-card/60"
                  }`}
                >
                  <div className="relative">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border font-semibold text-sm">
                      {t.initials}
                    </div>
                    {t.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold truncate">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground shrink-0">{t.time}</div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground truncate">{t.lastMessage}</div>
                      {t.unread > 0 && (
                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                          {t.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex flex-col min-w-0">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border font-semibold text-sm">
                  {active?.initials}
                </div>
                {active?.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
                )}
              </div>
              <div>
                <div className="font-semibold text-sm">{active?.name ?? "Select a conversation"}</div>
                <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${active?.online ? "bg-primary" : "bg-muted-foreground"}`} />
                  {active?.online ? "Online · E2E secure" : "Offline"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <IconBtn><Phone className="h-4 w-4" /></IconBtn>
              <IconBtn><Video className="h-4 w-4" /></IconBtn>
              <IconBtn><MoreHorizontal className="h-4 w-4" /></IconBtn>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-3 bg-secondary/30">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.from === "me"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-[oklch(0.955_0.006_250)] ring-1 ring-border text-foreground shadow-sm"
                  }`}>
                    <div className="leading-relaxed">{m.text}</div>
                    <div className={`mt-1 text-[10px] text-right ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</div>
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div key="typing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                  <div className="bg-[oklch(0.955_0.006_250)] ring-1 ring-border rounded-2xl px-4 py-2.5 text-sm inline-flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span key={i} animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} className="h-1.5 w-1.5 rounded-full bg-primary" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{active?.name} is typing…</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={send} className="border-t border-border px-4 py-3 flex items-center gap-2 bg-card">
            <button type="button" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-secondary transition">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write an encrypted message…"
              className="flex-1 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-[oklch(0.94_0.008_250)] border border-border focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              data-magnetic
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground glow-primary"
            >
              <Send className="h-4 w-4" /> Send
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-foreground">
      {children}
    </button>
  );
}
