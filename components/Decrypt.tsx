"use client";

import { useEffect, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>/\\";

export function Decrypt({ text, duration = 900, className }: { text: string; duration?: number; className?: string }) {
  const [out, setOut] = useState("");

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const reveal = Math.floor(p * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        if (i < reveal || text[i] === " ") s += text[i];
        else s += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration]);

  return <span className={className}>{out || text}</span>;
}
