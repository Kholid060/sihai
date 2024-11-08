import { hash } from 'ohash';
import { v5 } from 'uuid';

export function uuid(...args: string[]) {
  return v5(hash(args.join('')), v5.DNS);
}
