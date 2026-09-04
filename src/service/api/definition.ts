/* eslint-disable */
/* tslint:disable */
/** Do not modify manually.
content is generated automatically by `ts-gear`. */

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
