import type { LinkListItem } from '~/interface/link.interface';
import type { LinkQueryValidation } from '~/server/validation/link.validation';

export const useLinksStore = defineStore('links', () => {
  let fetchLinkListCursor: string | null = '';

  const links = ref<LinkListItem[]>([]);

  async function fetchLinkList(
    query: Omit<LinkQueryValidation, 'nextCursor'> = { sortBy: 'create-date' },
  ) {
    if (fetchLinkListCursor === null) return links.value;

    const result = await $fetch('/api/links', {
      params: { ...query },
      headers: useRequestHeaders(['cookie']),
    });
    links.value.push(...result.data.items);
    fetchLinkListCursor = result.data.nextCursor;

    return links.value;
  }
  function addLinkList(link: LinkListItem) {
    links.value?.push(link);
  }

  return {
    links,
    addLinkList,
    fetchLinkList,
  };
});
