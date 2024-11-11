declare module 'h3' {
  interface H3EventContext {
    user: import('@supabase/auth-js').User;
    drizzle: import('./server/lib/drizzle').DrizzleDB;
  }
}

export default {};
