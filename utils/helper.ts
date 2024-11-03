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

export function subtractCurrentDate(numberDay: number) {
  const date = new Date();
  date.setDate(date.getDate() - numberDay);

  return date;
}

export function generateTimeSeries(count: number, type: 'day' | 'hour') {
  const endDate = new Date();
  endDate.setMinutes(0);

  const result: Date[] = [endDate];

  for (let index = 1; index < count; index += 1) {
    const date = new Date();
    if (type === 'day') date.setDate(endDate.getDate() - index);
    else date.setHours(endDate.getHours() - index, 0);

    result.unshift(date);
  }

  return result;
}

export function isSameDate(left: Date, right: Date, by: 'hour' | 'date') {
  if (by === 'hour') return left.getHours() === right.getHours();

  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
