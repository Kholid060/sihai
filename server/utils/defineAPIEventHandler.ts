import type { EventHandler, EventHandlerRequest } from 'h3';
import { useDrizzle } from '../lib/drizzle';
import { authGuard } from '../guards/auth.guard';

interface Options {
  authGuard?: boolean;
}

export const defineAPIEventHandler = <T>(
  handler: EventHandler<EventHandlerRequest, T>,
  options: Partial<Options> = { authGuard: true },
) => {
  return defineEventHandler({
    onRequest: options.authGuard ? [authGuard] : undefined,
    handler: async (event) => {
      const drizzle = useDrizzle();
      event.context.drizzle = drizzle;

      const result = await handler(event);

      if (!import.meta.dev) event.waitUntil(drizzle.$client.end());

      return result;
    },
  });
};
