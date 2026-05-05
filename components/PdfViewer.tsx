import { AnimatePresence, motion } from "framer-motion";
import { X, FileText, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  documentName: string;
  userName: string;
  layoutId: string;
  pageCount?: number;
}

export function PdfViewer({ open, onClose, documentName, userName, layoutId, pageCount = 4 }: Props) {
  const [zoom, setZoom] = useState(1);
  const [page, setPage] = useState(1);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setZoom(1);
      setPage(1);
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(2, z + 0.15));
      if (e.key === "-") setZoom((z) => Math.max(0.6, z - 0.15));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const scrollToPage = (n: number) => {
    setPage(n);
    pageRefs.current[n - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pages = useMemo(() => Array.from({ length: pageCount }, (_, i) => i + 1), [pageCount]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[120] bg-foreground/40 backdrop-blur-xl p-4 md:p-10 grid place-items-center"
          onClick={onClose}
          data-testid="pdf-overlay"
        >
          <motion.div
            layoutId={layoutId}
            onClick={(e) => e.stopPropagation()}
            className="surface-lg relative w-full max-w-5xl h-[88vh] rounded-2xl overflow-hidden bg-card grid grid-cols-[140px_1fr]"
            transition={{ type: "spring", stiffness: 240, damping: 28 }}
          >
            {/* Thumbnails */}
            <aside className="hidden md:flex flex-col bg-secondary/40 border-r border-border overflow-y-auto">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sticky top-0 bg-secondary/80 backdrop-blur z-10">
                Pages · {pageCount}
              </div>
              <div className="p-2 space-y-2" data-testid="pdf-thumbnails">
                {pages.map((p) => (
                  <button
                    key={p}
                    onClick={() => scrollToPage(p)}
                    aria-label={`Go to page ${p}`}
                    aria-current={page === p}
                    className={`relative block w-full aspect-[3/4] rounded-md overflow-hidden text-[10px] font-semibold transition ${
                      page === p
                        ? "ring-2 ring-primary shadow-lg"
                        : "ring-1 ring-border hover:ring-primary/50"
                    }`}
                  >
                    <div className="absolute inset-0 bg-white p-1.5">
                      <div className="h-1 bg-slate-300 rounded mb-1" />
                      <div className="h-1 bg-slate-200 rounded mb-1 w-3/4" />
                      <div className="h-1 bg-slate-200 rounded mb-1" />
                      <div className="h-1 bg-slate-200 rounded mb-1 w-2/3" />
                      <div className="mt-2 h-6 bg-slate-100 rounded" />
                      <div className="mt-1 h-1 bg-slate-200 rounded w-5/6" />
                      <div className="mt-1 h-1 bg-slate-200 rounded w-3/4" />
                    </div>
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-foreground/70 text-background text-[10px]">{p}</span>
                  </button>
                ))}
              </div>
            </aside>

            {/* Right column */}
            <div className="flex flex-col min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-card">
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold truncate">{documentName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    aria-label="Previous page"
                    onClick={() => scrollToPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-muted-foreground min-w-12 text-center" data-testid="pdf-page-indicator">
                    {page} / {pageCount}
                  </span>
                  <button
                    aria-label="Next page"
                    onClick={() => scrollToPage(Math.min(pageCount, page + 1))}
                    disabled={page >= pageCount}
                    className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <span className="mx-2 h-5 w-px bg-border" />
                  <button
                    aria-label="Zoom out"
                    onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                    className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-muted-foreground min-w-10 text-center" data-testid="pdf-zoom-indicator">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    aria-label="Zoom in"
                    onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
                    className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Reset zoom"
                    onClick={() => setZoom(1)}
                    className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                  <span className="mx-2 h-5 w-px bg-border" />
                  <button className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 h-8 rounded-lg hover:bg-secondary">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                  <button
                    onClick={onClose}
                    aria-label="Close viewer"
                    className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Pages */}
              <div ref={scrollRef} className="relative flex-1 overflow-auto bg-secondary/60 px-6 py-8">
                <div
                  className="mx-auto space-y-6 origin-top transition-transform"
                  style={{ transform: `scale(${zoom})`, width: "fit-content" }}
                >
                  {pages.map((p) => (
                    <div
                      key={p}
                      ref={(el) => { pageRefs.current[p - 1] = el; }}
                      data-testid={`pdf-page-${p}`}
                      className="mx-auto w-[640px] bg-white text-slate-900 rounded-md p-10 shadow-2xl relative overflow-hidden"
                    >
                      <div className="pointer-events-none absolute inset-0 grid place-items-center">
                        <div className="rotate-[-30deg] font-display text-5xl font-bold text-foreground/10 tracking-widest text-center leading-tight">
                          CONFIDENTIAL<br />
                          <span className="text-3xl">{userName.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <h1 className="font-display text-3xl">Legal Brief</h1>
                        <span className="text-xs text-slate-400">Page {p} of {pageCount}</span>
                      </div>
                      <p className="text-xs uppercase tracking-widest text-slate-500 mt-1">{documentName}</p>
                      <hr className="my-4 border-slate-200" />
                      <p className="text-sm leading-relaxed text-slate-700">
                        {p === 1
                          ? "This document contains privileged attorney-client communication. Unauthorized disclosure is strictly prohibited under applicable law."
                          : `Section ${p}. Continued analysis of the matter at hand. The parties stipulate to the following facts and reservations as set out below.`}
                      </p>
                      <p className="text-sm leading-relaxed text-slate-700 mt-3">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                        nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </p>
                      <p className="text-sm leading-relaxed text-slate-700 mt-3">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                        fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                        culpa qui officia deserunt mollit anim id est laborum.
                      </p>
                      {p === pageCount && (
                        <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-slate-600">
                          <div><strong className="block text-slate-800">Client</strong>{userName}</div>
                          <div><strong className="block text-slate-800">Reference</strong>AVL-2026-0428</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
