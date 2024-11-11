import { deleteLink } from '~/server/services/link.service';

export default defineAPIEventHandler(async (event) => {
  await deleteLink(
    event.context.drizzle,
    event.context.user.id,
    getRouterParam(event, 'linkId')!,
  );
  return createAPIResponse(null);
});
