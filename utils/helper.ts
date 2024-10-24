import { FetchError } from 'ofetch';

// https://stackoverflow.com/a/39247950
export function maskEmail(emailStr: string) {
  return emailStr.replace(
    /^(.)(.*)(.@.*)$/,
    (_, a, b, c) => a + b.replace(/./g, '*') + c,
  );
}

export function getRedirectURL() {
  return new URL('/auth/redirect', window.location.href).href;
}

export function getFetchError(error: unknown) {
  if (error instanceof FetchError) {
    return {
      title: 'Error!',
      description: error.data.message ?? error.statusMessage,
    };
  }

  return {
    title: 'Something went wrong!',
    description: error instanceof Error ? error.message : '',
  };
}
