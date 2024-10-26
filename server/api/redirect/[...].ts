import Bowser from 'bowser';
import { isbot } from 'isbot';

export default defineEventHandler((event) => {
  console.log(isbot(event.headers.get('user-agent')!), event.path);
  return Bowser.parse(event.headers.get('user-agent')!);
});
