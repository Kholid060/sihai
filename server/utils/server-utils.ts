import type { ServerAPISuccessResonse } from '~/interface/server-api.interface';
import type { H3Event, EventHandlerRequest } from 'h3';
import type { z, ZodType } from 'zod';

export function createAPIResponse<T>(data: T): ServerAPISuccessResonse<T> {
  return {
    data,
    statusCode: 200,
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
