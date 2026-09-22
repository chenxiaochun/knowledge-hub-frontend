/* eslint-disable */
/* tslint:disable */
/** Do not modify manually.
content is generated automatically by `ts-gear`. */
export type ComponentsSchemasDocumentReviewEntityReviewResult = 1 | 2;
export type ComponentsSchemasDocumentEntityStatus = 0 | 1 | 2 | 3;
export interface UserVO {
  id: string;
  username: string;
  email?: string | null;
  realName?: string | null;
  avatar?: string | null;
  status: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  roleCodes: Array<string>;
}

export interface CreateUserDto {
  username: string;
  password: string;
  /** @format email */
  email?: string;
  realName?: string;
  avatar?: string;
  /**
   * @description
   *   0 禁用 1 启用，默认 1
   */
  status?: number;
  roleCodes?: Array<string>;
}

export interface UpdateUserDto {
  password?: string;
  /** @format email */
  email?: string;
  realName?: string;
  avatar?: string;
  status?: number;
  /**
   * @description
   *   角色编码，如 ROLE_ADMIN / ROLE_USER / ROLE_REVIEWER
   */
  roleCodes?: Array<string>;
}

export interface PermissionEntity {
  id: string;
  permissionName: string;
  permissionCode: string;
  /**
   * @description
   *   练习版固定 3=接口
   */
  permissionType: number;
  status: number;
}

export interface RoleEntity {
  id: string;
  roleName: string;
  roleCode: string;
  description?: string | null;
  status: number;
}

export interface SetRolePermissionsDto {
  permissionCodes: Array<string>;
}

export interface RegisterDto {
  username: string;
  password: string;
  /** @format email */
  email?: string;
  realName?: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface SendResetCodeDto {
  /** @format email */
  email: string;
}

export interface ResetPasswordDto {
  /** @format email */
  email: string;
  code: string;
  newPassword: string;
}

export interface UploadParseDto {
  categoryId?: string;
  teamId?: string;
  authorId?: string;
  tags?: string;
  remark?: string;
  createBy?: string;
  isPublic?: boolean;
}

export interface DocumentReviewEntity {
  id: string;
  documentId: string;
  reviewerId: string;
  reviewerName: string;
  reviewResult: ComponentsSchemasDocumentReviewEntityReviewResult;
  reviewComment: string;
  beforeStatus: number;
  /** @format date-time */
  reviewedAt: string;
  /** @format date-time */
  createdAt: string;
}

export interface DocumentEntity {
  id: string;
  title: string;
  /**
   * @description
   *   对应 Mongo document_content._id
   */
  contentId: string;
  authorId?: string | null;
  fileUrl?: string | null;
  fileExt?: string | null;
  status: ComponentsSchemasDocumentEntityStatus;
  wordCount: number;
  tags?: string | null;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  /** @format date-time */
  publishTime?: string | null;
  deleted: boolean;
}

export interface UpdateDocumentDto {
  title?: string;
  content?: string;
  tags?: string;
}

export interface SearchHighlightDto {
  title?: Array<string>;
  content?: Array<string>;
}

export interface SearchDocumentHitDto {
  id: string;
  score: number | null;
  title: string;
  summary?: string;
  authorId?: string | null;
  status: number;
  publishTime?: string | null;
  indexedAt?: string | null;
  tags?: string | null;
  highlight?: SearchHighlightDto;
}

export interface SearchDocumentsResultDto {
  items: Array<SearchDocumentHitDto>;
  total: number;
  page: number;
  pageSize: number;
}

export interface SemanticSearchHitDto {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
  heading: string | null;
  /**
   * @description
   *   当前阶段得分
   */
  score: number;
  bm25Score?: number;
  vectorScore?: number;
}

export interface GraphNodeHitDto {
  labels: Array<string>;
  /**
   * @description
   *   节点属性（随 label 变化：title/name/type/id 等）
   */
  props: {
    /**
        @description
          节点属性（随 label 变化：title/name/type/id 等） */
    [propertyName: string]: any;
  };
}

export interface GraphSubgraphNodeDto {
  /**
   * @description
   *   稳定 key：doc:{uuid} / entity:{name}
   */
  id: string;
  /**
   * @description
   *   展示名
   */
  name: string;
  /**
   * @description
   *   KnowledgeDocument | KnowledgeEntity
   */
  label: string;
  /**
   * @description
   *   实体类型 PERSON / ORGANIZATION 等
   */
  type?: string | null;
  /**
   * @description
   *   仅文档节点，供前端 openDetail
   */
  documentId?: string;
}

export interface GraphSubgraphEdgeDto {
  /**
   * @description
   *   对应 node.id
   */
  source: string;
  target: string;
  /**
   * @description
   *   RELATED_TO 边属性 relation（或 MENTIONS）
   */
  relation: string;
  weight?: number;
}

export interface GraphSubgraphResultDto {
  nodes: Array<GraphSubgraphNodeDto>;
  edges: Array<GraphSubgraphEdgeDto>;
}

export interface CreateTeamDto {
  teamName: string;
  /** @default null */
  teamCode?: string | null;
  description?: string;
  parentId?: string;
  sort?: number;
  status?: number;
}

export interface TeamEntity {
  id: string;
  teamName: string;
  /** @default null */
  teamCode?: string | null;
  /** @default null */
  description?: string | null;
  parentId: string;
  sort: number;
  status: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  deleted: boolean;
}

export interface UpdateTeamDto {
  teamName?: string;
  teamCode?: string;
  description?: string;
  parentId?: string;
  sort?: number;
  status?: number;
}
