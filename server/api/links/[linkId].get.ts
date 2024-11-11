import { findLinkByUserAndId } from '~/server/services/link.service';

export default defineAPIEventHandler(async (event) => {
  const result = await findLinkByUserAndId(
    event.context.drizzle,
    event.context.user.id,
    getRouterParam(event, 'linkId')!,
  );
  return createAPIResponse(result);
});
