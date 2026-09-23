import type { Dayjs } from 'dayjs';

import type { GraphOverviewQuery } from './types';

export function toOverviewQuery(
  keywordInput: string,
  entityType: string,
  dateRange: [Dayjs | null, Dayjs | null] | null,
  docLimit: number,
): GraphOverviewQuery {
  return {
    keyword: keywordInput.trim() || ' ',
    entityType: entityType || '',
    from: dateRange?.[0]?.startOf('day').toISOString() ?? '',
    to: dateRange?.[1]?.endOf('day').toISOString() ?? '',
    docLimit,
  };
}
