/* eslint-disable */
/* tslint:disable */
/** Do not modify manually.
content is generated automatically by `ts-gear`. */

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
}

export interface CreateAuthDto {}

export interface UpdateAuthDto {}
