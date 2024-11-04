export function useNumberFormatter(
  options?: Intl.NumberFormatOptions,
  locale?: string,
) {
  return new Intl.NumberFormat(
    locale ?? useDefaultLocale().value,
    options ?? {
      notation: 'compact',
      maximumSignificantDigits: 3,
    },
  );
}
