import type { CollectionKey } from 'astro:content';
import { getCollection } from 'astro:content';

type SortableKeys = 'pubDate' | 'updatedDate';

export const getSortedCollection = async (
  collection: CollectionKey,
  sortBy: SortableKeys = 'pubDate'
) => (await getCollection(collection)).sort(
    (a, b) => (b.data[sortBy] as Date).valueOf() - (a.data[sortBy] as Date).valueOf()
  );
