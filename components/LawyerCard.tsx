import { Star, Briefcase, MapPin } from "lucide-react";
import type { Lawyer } from "@/lib/mock-data";
import { Tilt3D, TiltLayer } from "@/components/Tilt3D";

export function LawyerCard({ lawyer, onBook }: { lawyer: Lawyer; onBook: (l: Lawyer) => void }) {
  const specialtyClass = {
    Business: "chip-emerald",
    Penal: "chip-rose",
    Family: "chip-amber",
  }[lawyer.specialty];

  return (
    <Tilt3D className="group relative">
      <div className="relative surface rounded-2xl p-6 overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
        {/* Background layer (z=0) — stays flat */}
        <TiltLayer z={0}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-accent/50 font-display text-lg text-foreground">
                {lawyer.initials}
              </div>
              <div>
                <h3 className="font-display text-lg leading-tight">{lawyer.name}</h3>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {lawyer.city}
                </div>
              </div>
            </div>
            <div className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${specialtyClass}`}>
              {lawyer.specialty}
            </div>
          </div>
        </TiltLayer>

        {/* Text content (z=30) — floats above background */}
        <TiltLayer z={30}>
          <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{lawyer.bio}</p>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-[oklch(0.72_0.10_80)] text-[oklch(0.72_0.10_80)]" />
              {lawyer.rating}
            </span>
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {lawyer.cases} cases
            </span>
          </div>
        </TiltLayer>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <TiltLayer z={30}>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Hourly</div>
              <div className="font-display text-2xl text-gradient">€{lawyer.rate}</div>
            </div>
          </TiltLayer>

          <TiltLayer z={60}>
            <button
              onClick={() => onBook(lawyer)}
              data-magnetic
              className="relative inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground glow-primary hover:brightness-110 transition shadow-lg"
            >
              Book Now
            </button>
          </TiltLayer>
        </div>
      </div>
    </Tilt3D>
  );
}
