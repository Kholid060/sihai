export function createLimitExceedError(name: string) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden',
    message: `${name}'s limit exceeded`,
  });
}
