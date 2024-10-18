import type { H3Event } from 'h3';
import type { ServerGuard } from '~/interface/server.interface';

export function withGuard<T>(
  handler: (event: H3Event) => T,
  guards: ServerGuard[],
) {
  return async (event: H3Event) => {
    for (const guard of guards) await guard(event);

    return handler(event);
  };
}
