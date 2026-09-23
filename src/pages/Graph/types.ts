import type { Dayjs } from 'dayjs';

export type GraphOverviewNodeKind = 'document' | 'entity' | 'tag';

export type GraphOverviewEdgeKind = 'mentions' | 'related' | 'tagged';

export interface GraphOverviewNodeDto {
  id: string;
  name: string;
  kind: GraphOverviewNodeKind;
  type?: string | null;
  documentId?: string | null;
  updatedAt?: string | null;
  description?: string | null;
}

export interface GraphOverviewEdgeDto {
  source: string;
  target: string;
  relation: string;
  kind: GraphOverviewEdgeKind;
}

export interface GraphOverviewStatsDto {
  nodeCount: number;
  edgeCount: number;
  documentCount: number;
  entityCount: number;
  tagCount: number;
  mentionCount: number;
  relatedCount: number;
  entityTypes: Array<{ type: string; count: number }>;
}

export interface GraphOverviewTopEntityDto {
  name: string;
  type: string | null;
  degree: number;
}

export interface GraphOverviewRecentNodeDto {
  id: string;
  name: string;
  kind: string;
  updatedAt: string | null;
  fileExt?: string | null;
}

export interface GraphOverviewResultDto {
  nodes: GraphOverviewNodeDto[];
  edges: GraphOverviewEdgeDto[];
  stats: GraphOverviewStatsDto;
  topEntities: GraphOverviewTopEntityDto[];
  recentNodes: GraphOverviewRecentNodeDto[];
  entityTypes: string[];
}

export type GraphOverviewQuery = {
  keyword: string;
  entityType: string;
  from: string;
  to: string;
  docLimit: number;
};

export type GraphFilterFormValues = {
  keyword: string;
  entityType?: string;
  dateRange: [Dayjs | null, Dayjs | null] | null;
};
