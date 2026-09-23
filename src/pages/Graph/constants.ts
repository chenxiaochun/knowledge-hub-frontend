import type { GraphFilterFormValues, GraphOverviewResultDto } from './types';

export const DEFAULT_DOC_LIMIT = 80;

export const DEFAULT_FILTER_VALUES: GraphFilterFormValues = {
  keyword: '',
  entityType: '',
  dateRange: null,
};

export const EMPTY_OVERVIEW: GraphOverviewResultDto = {
  nodes: [],
  edges: [],
  stats: {
    nodeCount: 0,
    edgeCount: 0,
    documentCount: 0,
    entityCount: 0,
    tagCount: 0,
    mentionCount: 0,
    relatedCount: 0,
    entityTypes: [],
  },
  topEntities: [],
  recentNodes: [],
  entityTypes: [],
};
