import type { LinkVariableList } from '~/interface/link.interface';

export function linkVariableReplacer(
  url: string,
  replacer: (name: LinkVariableList, match: string) => string,
) {
  return url.replace(/\{(.*?)\}/g, (match, varName) => {
    return replacer(varName as LinkVariableList, match);
  });
}
