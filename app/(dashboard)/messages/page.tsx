"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, ShieldCheck, Search, MoreVertical } from "lucide-react";
import { useApp } from "@/lib/store";
import { LAWYERS } from "@/lib/mock-data";

interface Message {
  id: string;
  from: "user" | "lawyer";
  text: string;
  time: string;
  encrypted: boolean;
}

const MOCK_MESSAGES: Message[] = [
  { id: "1", from: "lawyer", text: "Hello! I've reviewed the documents you sent. Everything looks in order for the preliminary consultation.", time: "10:32 AM", encrypted: true },
  { id: "2", from: "user", text: "Great to hear! When can we schedule a call to discuss the next steps?", time: "10:35 AM", encrypted: true },
  { id: "3", from: "lawyer", text: "I have availability tomorrow at 2 PM or Friday at 10 AM. Which works better for you?", time: "10:38 AM", encrypted: true },
  { id: "4", from: "user", text: "Friday at 10 AM works perfectly. Should I prepare anything specific?", time: "10:42 AM", encrypted: true },
  { id: "5", from: "lawyer", text: "Please have your ID and the original contract ready. I'll send a secure link for the video call.", time: "10:45 AM", encrypted: true },
];

export default function MessagesPage() {
  const user = useApp((s) => s.user);
  const consultations = useApp((s) => s.consultations);
  const [selectedId, setSelectedId] = useState<string | null>(consultations[0]?.lawyer.id || LAWYERS[0].id);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");

  const contacts = consultations.length > 0 
    ? consultations.map((c) => c.lawyer)
    : LAWYERS.slice(0, 3);

  const selectedContact = contacts.find((c) => c.id === selectedId) || contacts[0];

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: crypto.randomUUID(),
      from: "user",
      text: input,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      encrypted: true,
    };
    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate reply
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        from: "lawyer",
        text: "Thank you for your message. I'll review and get back to you shortly.",
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        encrypted: true,
      }]);
    }, 2000);
  };

  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[500px]">
      {/* Contacts sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full rounded-xl surface pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/30"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedId(contact.id)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition ${
                selectedId === contact.id ? "bg-secondary/50" : ""
              }`}
            >
              <div className="relative">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-accent/50 font-display">
                  {contact.initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium truncate">{contact.name}</p>
                <p className="text-xs text-muted-foreground truncate">{contact.specialty}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">10:45</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-accent/50 font-display text-sm">
              {selectedContact?.initials}
            </div>
            <div>
              <p className="font-medium">{selectedContact?.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full chip-emerald px-3 py-1 text-[10px]">
              <ShieldCheck className="h-3 w-3" />
              E2E Encrypted
            </div>
            <button className="p-2 rounded-lg hover:bg-secondary transition">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.from === "user"
                      ? "bg-primary text-primary-foreground"
                      : "surface"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 flex items-center gap-1 ${
                    msg.from === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}>
                    {msg.time}
                    {msg.encrypted && <ShieldCheck className="h-3 w-3" />}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl surface hover:bg-secondary transition">
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 rounded-xl surface px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
