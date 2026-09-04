/* eslint-disable */
/* tslint:disable */
/** Do not modify manually.
content is generated automatically by `ts-gear`. */
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

export interface UploadParseDto {
  tags?: string;
  remark?: string;
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
