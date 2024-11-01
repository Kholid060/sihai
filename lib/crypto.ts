import { hash } from 'crypto';
import { v5 } from 'uuid';

export function uuid(...args: string[]) {
  return v5(hash('sha512', args.join(''), 'hex'), v5.DNS);
}
