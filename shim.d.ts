import type { SelectUser } from './db/schema';

declare module 'h3' {
  interface H3EventContext {
    userProfile: SelectUser;
    user: import('@supabase/auth-js').User;
  }
}

export default {};
