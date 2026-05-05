import { supabase } from "@/integrations/supabase/client";
import type { Specialty } from "./mock-data";

export interface LawyerRow {
  id: string;
  name: string;
  email: string;
  specialty: Specialty | null;
  barreau: string | null;
  city: string | null;
  bio: string | null;
  rate: number | null;
  rating: number | null;
  cases: number | null;
}

export interface ConsultationRow {
  id: string;
  client_id: string;
  lawyer_id: string;
  scheduled_at: string;
  document_name: string;
  status: "Pending" | "Analyzing" | "Confirmed";
  created_at: string;
  // joined
  lawyer?: LawyerRow | null;
  client?: { id: string; name: string; email: string } | null;
}

export function initialsOf(name: string | null | undefined): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "??";
}

export async function fetchLawyers(filters: {
  specialty?: Specialty | "All";
  maxRate?: number;
  q?: string;
}) {
  let query = supabase
    .from("profiles")
    .select("id,name,email,specialty,barreau,city,bio,rate,rating,cases,role")
    .eq("role", "lawyer");

  if (filters.specialty && filters.specialty !== "All") {
    query = query.eq("specialty", filters.specialty);
  }
  if (typeof filters.maxRate === "number") {
    // include lawyers without a rate yet (null) so newly-onboarded show up
    query = query.or(`rate.lte.${filters.maxRate},rate.is.null`);
  }
  if (filters.q && filters.q.trim()) {
    const term = filters.q.trim().replace(/[%,]/g, "");
    query = query.or(`name.ilike.%${term}%,city.ilike.%${term}%`);
  }

  const { data, error } = await query.order("rating", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as unknown as LawyerRow[];
}

export async function fetchMyConsultations() {
  const { data, error } = await supabase
    .from("consultations")
    .select(
      "id,client_id,lawyer_id,scheduled_at,document_name,status,created_at,lawyer:profiles!consultations_lawyer_id_fkey(id,name,email,specialty,barreau,city,bio,rate,rating,cases),client:profiles!consultations_client_id_fkey(id,name,email)"
    )
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ConsultationRow[];
}

export async function createConsultation(input: {
  lawyer_id: string;
  scheduled_at: string;
  document_name: string;
}) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("consultations")
    .insert({
      client_id: uid,
      lawyer_id: input.lawyer_id,
      scheduled_at: input.scheduled_at,
      document_name: input.document_name,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function advanceConsultation(id: string, current: ConsultationRow["status"]) {
  const order: ConsultationRow["status"][] = ["Pending", "Analyzing", "Confirmed"];
  const next = order[Math.min(order.length - 1, order.indexOf(current) + 1)];
  const { error } = await supabase
    .from("consultations")
    .update({ status: next })
    .eq("id", id);
  if (error) throw error;
  return next;
}
