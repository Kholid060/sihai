declare module '*.png' {
  const value: string;
  export default value;
}

declare module 'bowser/src/constants' {
  export const BROWSER_ALIASES_MAP: Record<string, string>;
}
