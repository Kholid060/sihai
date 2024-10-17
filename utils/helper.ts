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
