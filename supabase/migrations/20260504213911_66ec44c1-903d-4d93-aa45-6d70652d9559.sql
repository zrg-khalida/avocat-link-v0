CREATE OR REPLACE FUNCTION public.is_consultation_participant(_consultation UUID, _user UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.consultations c
    WHERE c.id = _consultation
      AND (c.client_id = _user OR c.lawyer_id = _user)
  );
$$;