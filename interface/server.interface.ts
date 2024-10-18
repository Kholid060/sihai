import type { H3Event } from 'h3';

export type ServerGuard = (event: H3Event) => unknown | Promise<unknown>;
