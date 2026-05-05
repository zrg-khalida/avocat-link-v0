export type Specialty = "Business" | "Penal" | "Family";

export interface Lawyer {
  id: string;
  name: string;
  specialty: Specialty;
  rate: number;
  rating: number;
  cases: number;
  city: string;
  initials: string;
  bio: string;
}

export const LAWYERS: Lawyer[] = [
  { id: "1", name: "Amelia Laurent", specialty: "Business", rate: 280, rating: 4.9, cases: 142, city: "Paris", initials: "AL", bio: "M&A and corporate restructuring specialist." },
  { id: "2", name: "Julien Moreau", specialty: "Penal", rate: 320, rating: 4.8, cases: 98, city: "Lyon", initials: "JM", bio: "Criminal defense — 15 years at the bar." },
  { id: "3", name: "Sofia Renard", specialty: "Family", rate: 190, rating: 4.95, cases: 211, city: "Bordeaux", initials: "SR", bio: "Mediation, divorce, custody arrangements." },
  { id: "4", name: "Marc Delacroix", specialty: "Business", rate: 410, rating: 4.7, cases: 76, city: "Paris", initials: "MD", bio: "International contracts & arbitration." },
  { id: "5", name: "Inès Vautrin", specialty: "Penal", rate: 250, rating: 4.85, cases: 134, city: "Marseille", initials: "IV", bio: "White-collar crime defense." },
  { id: "6", name: "Théo Bonnet", specialty: "Family", rate: 175, rating: 4.75, cases: 188, city: "Nantes", initials: "TB", bio: "Estate planning and family disputes." },
  { id: "7", name: "Clara Aubert", specialty: "Business", rate: 360, rating: 4.92, cases: 105, city: "Paris", initials: "CA", bio: "Startup law — fundraising & IP." },
  { id: "8", name: "Hugo Lefèvre", specialty: "Penal", rate: 290, rating: 4.6, cases: 87, city: "Toulouse", initials: "HL", bio: "Appeals and constitutional litigation." },
];

export interface Consultation {
  id: string;
  lawyer: Lawyer;
  date: string;
  status: "Pending" | "Analyzing" | "Confirmed";
  documentName: string;
}

export const INITIAL_CONSULTATIONS: Consultation[] = [
  { id: "c1", lawyer: LAWYERS[0], date: new Date(Date.now() + 60 * 1000).toISOString(), status: "Confirmed", documentName: "NDA_Acquisition_v3.pdf" },
  { id: "c2", lawyer: LAWYERS[2], date: "2026-04-30T14:30:00", status: "Analyzing", documentName: "Custody_Brief.pdf" },
  { id: "c3", lawyer: LAWYERS[4], date: "2026-05-02T09:00:00", status: "Pending", documentName: "Case_File_2026.pdf" },
];

export interface LawyerRequest {
  id: string;
  clientName: string;
  clientInitials: string;
  subject: string;
  specialty: Specialty;
  documentName: string;
  estimatedFee: number;
  submittedAt: string;
  status: "pending" | "accepted" | "declined";
}

export const INITIAL_REQUESTS: LawyerRequest[] = [
  { id: "r1", clientName: "Camille Roux", clientInitials: "CR", subject: "Shareholder dispute — minority buyout", specialty: "Business", documentName: "Shareholder_Notice.pdf", estimatedFee: 1200, submittedAt: "2026-04-18T09:14:00", status: "pending" },
  { id: "r2", clientName: "Nadia Brahimi", clientInitials: "NB", subject: "Custody modification request", specialty: "Family", documentName: "Court_Order_v2.pdf", estimatedFee: 780, submittedAt: "2026-04-18T11:42:00", status: "pending" },
  { id: "r3", clientName: "Étienne Fabre", clientInitials: "EF", subject: "Appeal — fraud charges", specialty: "Penal", documentName: "Trial_Transcript.pdf", estimatedFee: 2400, submittedAt: "2026-04-17T16:05:00", status: "pending" },
  { id: "r4", clientName: "Yasmine Cohen", clientInitials: "YC", subject: "M&A advisory — series B", specialty: "Business", documentName: "Term_Sheet.pdf", estimatedFee: 3100, submittedAt: "2026-04-17T08:00:00", status: "accepted" },
];
