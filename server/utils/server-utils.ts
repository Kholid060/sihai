import type { ServerAPISuccessResonse } from '~/interface/server-api.interface';

export function createAPIResponse<T>(data: T): ServerAPISuccessResonse<T> {
  return {
    data,
    statusCode: 200,
  };
}
