-- Extend profiles with lawyer-discovery fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS rate integer,
  ADD COLUMN IF NOT EXISTS rating numeric(3,2),
  ADD COLUMN IF NOT EXISTS cases integer NOT NULL DEFAULT 0;

-- Allow any authenticated user to view LAWYER profiles (directory listing).
-- Client profiles remain owner-only via the existing policy.
DROP POLICY IF EXISTS "Lawyer profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Lawyer profiles are viewable by authenticated users"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (role = 'lawyer');

-- Consultations
CREATE TABLE IF NOT EXISTS public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lawyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  document_name text NOT NULL DEFAULT 'consultation_brief.pdf',
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Analyzing','Confirmed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultations_client ON public.consultations(client_id);
CREATE INDEX IF NOT EXISTS idx_consultations_lawyer ON public.consultations(lawyer_id);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Clients can view their own consultations; lawyers can view those assigned to them.
DROP POLICY IF EXISTS "View own consultations" ON public.consultations;
CREATE POLICY "View own consultations"
  ON public.consultations FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = lawyer_id);

-- Clients create consultations as themselves.
DROP POLICY IF EXISTS "Clients insert own consultations" ON public.consultations;
CREATE POLICY "Clients insert own consultations"
  ON public.consultations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

-- Either party can update status (e.g. advance / accept).
DROP POLICY IF EXISTS "Participants update consultations" ON public.consultations;
CREATE POLICY "Participants update consultations"
  ON public.consultations FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = lawyer_id)
  WITH CHECK (auth.uid() = client_id OR auth.uid() = lawyer_id);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_consultations_updated_at ON public.consultations;
CREATE TRIGGER trg_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();