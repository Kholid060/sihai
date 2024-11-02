import type { ServerAPISuccessResonse } from '~/interface/server-api.interface';
import type { H3Event, EventHandlerRequest } from 'h3';
import type { z, ZodType } from 'zod';

export function createAPIResponse<T>(
  data: T,
  statusCode = 200,
): ServerAPISuccessResonse<T> {
  return {
    data,
    statusCode,
  };
}

export async function getValidatedEventData<T extends ZodType>(
  event: H3Event<EventHandlerRequest>,
  type: 'query' | 'body',
  schema: T,
): Promise<z.infer<T>> {
  if (
    type === 'body' &&
    event.headers.get('Content-Type') !== 'application/json'
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    });
  }

  const result = await schema.safeParseAsync(
    type === 'body' ? await readBody(event) : getQuery(event),
  );
  if (result.error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: import.meta.dev ? result.error : null,
    });
  }

  return result.data;
}

export function getTheRequestPath(event: H3Event, sliceStart = 0) {
  let path = event.path;

  const queryIndex = path.indexOf('?');
  if (queryIndex !== -1) path = path.slice(sliceStart, queryIndex);
  else if (typeof sliceStart === 'number') path = path.slice(sliceStart);

  return path;
}

export function addCachePrefixKey(prefix: string) {
  return (...args: unknown[]) => `${prefix}:${args.join('')}`;
}
