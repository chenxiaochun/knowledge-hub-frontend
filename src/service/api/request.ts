/* eslint-disable */
/* tslint:disable */
/** Do not modify manually.
content is generated automatically by `ts-gear`. */
import { request as requester } from "../../utils/request";
import type {
  UserVO,
  UpdateUserDto,
  CreateUserDto,
  CreateAuthDto,
  UpdateAuthDto,
} from "./definition";

/** @description response type for get */
export interface GetResponse {
  /** @description */
  200: string;
}

export type GetResponseSuccess = GetResponse[200];
/** @tags App */
export const get = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/";
  function request(): Promise<GetResponseSuccess> {
    return requester(request.url, {
      method: request.method,
    }) as unknown as Promise<GetResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getUserPage */
export interface GetUserPageOption {
  query?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  };
}

/** @description response type for getUserPage */
export interface GetUserPageResponse {
  /** @description */
  200: any;
}

export type GetUserPageResponseSuccess = GetUserPageResponse[200];
/** @tags User */
export const getUserPage = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/user/page";
  function request(
    option?: GetUserPageOption
  ): Promise<GetUserPageResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetUserPageResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getUserId */
export interface GetUserIdOption {
  path: {
    id: string;
  };
}

/** @description response type for getUserId */
export interface GetUserIdResponse {
  /** @description */
  200: UserVO;
}

export type GetUserIdResponseSuccess = GetUserIdResponse[200];
/** @tags User */
export const getUserId = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/user/:id";
  function request(option: GetUserIdOption): Promise<GetUserIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetUserIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for putUserId */
export interface PutUserIdOption {
  path: {
    id: string;
  };
}

/** @description request parameter type for putUserId */
export interface PutUserIdOption {
  body: UpdateUserDto;
}

/** @description response type for putUserId */
export interface PutUserIdResponse {
  /** @description */
  200: UserVO;
}

export type PutUserIdResponseSuccess = PutUserIdResponse[200];
/** @tags User */
export const putUserId = /* #__PURE__ */ (() => {
  const method = "put";
  const url = "/user/:id";
  function request(option: PutUserIdOption): Promise<PutUserIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PutUserIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for deleteUserId */
export interface DeleteUserIdOption {
  path: {
    id: string;
  };
}

/** @description response type for deleteUserId */
export interface DeleteUserIdResponse {
  /** @description */
  200: UserVO;
}

export type DeleteUserIdResponseSuccess = DeleteUserIdResponse[200];
/** @tags User */
export const deleteUserId = /* #__PURE__ */ (() => {
  const method = "delete";
  const url = "/user/:id";
  function request(
    option: DeleteUserIdOption
  ): Promise<DeleteUserIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<DeleteUserIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for postUser */
export interface PostUserOption {
  body: CreateUserDto;
}

/** @description response type for postUser */
export interface PostUserResponse {
  /** @description */
  201: UserVO;
}

export type PostUserResponseSuccess = PostUserResponse[201];
/** @tags User */
export const postUser = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/user";
  function request(option: PostUserOption): Promise<PostUserResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostUserResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description response type for postUserRegister */
export interface PostUserRegisterResponse {
  /** @description */
  201: any;
}

export type PostUserRegisterResponseSuccess = PostUserRegisterResponse[201];
/** @tags User */
export const postUserRegister = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/user/register";
  function request(): Promise<PostUserRegisterResponseSuccess> {
    return requester(request.url, {
      method: request.method,
    }) as unknown as Promise<PostUserRegisterResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description response type for getAuth */
export interface GetAuthResponse {
  /** @description */
  200: string;
}

export type GetAuthResponseSuccess = GetAuthResponse[200];
/** @tags Auth */
export const getAuth = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/auth";
  function request(): Promise<GetAuthResponseSuccess> {
    return requester(request.url, {
      method: request.method,
    }) as unknown as Promise<GetAuthResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for postAuth */
export interface PostAuthOption {
  body: CreateAuthDto;
}

/** @description response type for postAuth */
export interface PostAuthResponse {
  /** @description */
  201: string;
}

export type PostAuthResponseSuccess = PostAuthResponse[201];
/** @tags Auth */
export const postAuth = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/auth";
  function request(option: PostAuthOption): Promise<PostAuthResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostAuthResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getAuthId */
export interface GetAuthIdOption {
  path: {
    id: string;
  };
}

/** @description response type for getAuthId */
export interface GetAuthIdResponse {
  /** @description */
  200: string;
}

export type GetAuthIdResponseSuccess = GetAuthIdResponse[200];
/** @tags Auth */
export const getAuthId = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/auth/:id";
  function request(option: GetAuthIdOption): Promise<GetAuthIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetAuthIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for deleteAuthId */
export interface DeleteAuthIdOption {
  path: {
    id: string;
  };
}

/** @description response type for deleteAuthId */
export interface DeleteAuthIdResponse {
  /** @description */
  200: string;
}

export type DeleteAuthIdResponseSuccess = DeleteAuthIdResponse[200];
/** @tags Auth */
export const deleteAuthId = /* #__PURE__ */ (() => {
  const method = "delete";
  const url = "/auth/:id";
  function request(
    option: DeleteAuthIdOption
  ): Promise<DeleteAuthIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<DeleteAuthIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for patchAuthId */
export interface PatchAuthIdOption {
  path: {
    id: string;
  };
}

/** @description request parameter type for patchAuthId */
export interface PatchAuthIdOption {
  body: UpdateAuthDto;
}

/** @description response type for patchAuthId */
export interface PatchAuthIdResponse {
  /** @description */
  200: string;
}

export type PatchAuthIdResponseSuccess = PatchAuthIdResponse[200];
/** @tags Auth */
export const patchAuthId = /* #__PURE__ */ (() => {
  const method = "patch";
  const url = "/auth/:id";
  function request(
    option: PatchAuthIdOption
  ): Promise<PatchAuthIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PatchAuthIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();
