REVOKE EXECUTE ON FUNCTION public.is_consultation_participant(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_consultation_participant(UUID, UUID) TO authenticated;