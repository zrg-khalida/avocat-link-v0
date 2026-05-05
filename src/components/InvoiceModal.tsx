import { AnimatePresence, motion } from "framer-motion";
import { X, Printer, Scale, ShieldCheck } from "lucide-react";

export interface InvoiceData {
  clientName: string;
  lawyerName: string;
  rate: number;
  hours: number;
  date: string;
  reference: string;
}

export function InvoiceModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: InvoiceData | null;
}) {
  const subtotal = data ? data.rate * data.hours : 0;
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  const handlePrint = () => {
    const node = document.getElementById("invoice-print");
    if (!node) return;
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(`<html><head><title>Invoice ${data?.reference ?? ""}</title>
      <style>
        body{font-family:'Inter',sans-serif;color:#0f172a;padding:48px;margin:0;background:#fff}
        h1{font-family:'Playfair Display',serif;letter-spacing:-0.02em;color:#0B1B3A}
        .muted{color:#64748b}
        table{width:100%;border-collapse:collapse;margin-top:24px}
        th,td{text-align:left;padding:12px 0;border-bottom:1px solid #e2e8f0;font-size:14px}
        th{font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b}
        .total{font-size:24px;font-family:'Playfair Display',serif;color:#0B1B3A}
      </style></head><body>${node.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 250);
  };

  return (
    <AnimatePresence>
      {open && data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[120] grid place-items-center bg-foreground/40 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="surface-lg relative w-full max-w-2xl rounded-3xl bg-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
              <div className="text-sm font-semibold inline-flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" /> Receipt / Invoice
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground glow-primary">
                  <Printer className="h-3.5 w-3.5" /> Print / Save PDF
                </button>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
            </div>

            <div id="invoice-print" className="bg-white text-slate-900 p-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#0B1B3A] text-white">
                      <Scale className="h-4 w-4" />
                    </div>
                    <span className="font-display text-xl font-semibold">Avocat·Link</span>
                  </div>
                  <p className="muted text-xs mt-2 text-slate-500">12 Rue de la Loi · 75001 Paris · SIREN 851 234 567</p>
                </div>
                <div className="text-right">
                  <h1 className="font-display text-3xl">Invoice</h1>
                  <p className="text-xs text-slate-500 mt-1">N° {data.reference}</p>
                  <p className="text-xs text-slate-500">Issued {new Date(data.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">Billed to</div>
                  <div className="mt-1 font-semibold">{data.clientName}</div>
                  <div className="text-slate-600">Client · Avocat-Link</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">From</div>
                  <div className="mt-1 font-semibold">Counsel {data.lawyerName}</div>
                  <div className="text-slate-600">Counsel · Bar registered</div>
                </div>
              </div>

              <table className="w-full mt-8 text-sm border-collapse">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                    <th className="text-left py-2 border-b border-slate-200">Description</th>
                    <th className="text-right py-2 border-b border-slate-200">Hours</th>
                    <th className="text-right py-2 border-b border-slate-200">Rate</th>
                    <th className="text-right py-2 border-b border-slate-200">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 border-b border-slate-100">Legal consultation & document review</td>
                    <td className="py-3 border-b border-slate-100 text-right">{data.hours.toFixed(1)}</td>
                    <td className="py-3 border-b border-slate-100 text-right">€{data.rate}</td>
                    <td className="py-3 border-b border-slate-100 text-right">€{subtotal.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-6 flex justify-end">
                <div className="w-64 text-sm">
                  <div className="flex justify-between py-1"><span className="text-slate-500">Subtotal</span><span>€{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-500">VAT (20%)</span><span>€{tax.toFixed(2)}</span></div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-slate-200">
                    <span className="font-semibold">Total due</span>
                    <span className="font-display text-2xl text-[#0B1B3A]">€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <div className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#B8924A]" /> Issued via Avocat·Link · digitally signed</div>
                <div>Thank you for your trust.</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
