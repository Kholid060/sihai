export default defineNuxtRouteMiddleware(async (to) => {
  const tokenHash = to.params.token as string;
  if (!tokenHash) return abortNavigation();

  const supabase = useSupabaseClient();
  const { error } = await supabase.auth.verifyOtp({
    type: 'recovery',
    token_hash: tokenHash,
  });

  if (error) return abortNavigation();
});
