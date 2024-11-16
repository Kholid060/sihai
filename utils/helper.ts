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

export function generateTimeSeries(
  count: number,
  type: 'day' | 'hour',
  startDate = new Date(),
) {
  const endDate = startDate;
  endDate.setMinutes(0);

  const result: Date[] = [endDate];

  for (let index = 1; index < count + 1; index += 1) {
    const date = new Date(endDate);
    if (type === 'day') date.setDate(endDate.getDate() - index);
    else date.setHours(endDate.getHours() - index, 0);

    result.unshift(date);
  }

  return result;
}

export function isSameDate(left: Date, right: Date, by: 'hour' | 'date') {
  const isDateEqual =
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  if (by === 'hour') return isDateEqual && left.getHours() === right.getHours();

  return isDateEqual;
}

export function dateDiffInDays(left: Date, right: Date) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(left.getFullYear(), left.getMonth(), left.getDate());
  const utc2 = Date.UTC(right.getFullYear(), right.getMonth(), right.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

export function joinWords(words: string[]) {
  switch (words.length) {
    case 0:
      return '';
    case 1:
      return words[0];
    case 2:
      return `${words[0]} and ${words[1]}`;
    default: {
      const lastWord = words.pop();
      return `${words.join(', ')}, and ${lastWord}`;
    }
  }
}
