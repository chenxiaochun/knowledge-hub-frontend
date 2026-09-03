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

/** @description response type for getApi */
export interface GetApiResponse {
  /** @description */
  200: string;
}

export type GetApiResponseSuccess = GetApiResponse[200];
/** @tags App */
export const getApi = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api";
  function request(): Promise<GetApiResponseSuccess> {
    return requester(request.url, {
      method: request.method,
    }) as unknown as Promise<GetApiResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiUserPage */
export interface GetApiUserPageOption {
  query?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  };
}

/** @description response type for getApiUserPage */
export interface GetApiUserPageResponse {
  /** @description */
  200: any;
}

export type GetApiUserPageResponseSuccess = GetApiUserPageResponse[200];
/** @tags User */
export const getApiUserPage = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/user/page";
  function request(
    option?: GetApiUserPageOption
  ): Promise<GetApiUserPageResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiUserPageResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiUserId */
export interface GetApiUserIdOption {
  path: {
    id: string;
  };
}

/** @description response type for getApiUserId */
export interface GetApiUserIdResponse {
  /** @description */
  200: UserVO;
}

export type GetApiUserIdResponseSuccess = GetApiUserIdResponse[200];
/** @tags User */
export const getApiUserId = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/user/:id";
  function request(
    option: GetApiUserIdOption
  ): Promise<GetApiUserIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiUserIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for putApiUserId */
export interface PutApiUserIdOption {
  path: {
    id: string;
  };
}

/** @description request parameter type for putApiUserId */
export interface PutApiUserIdOption {
  body: UpdateUserDto;
}

/** @description response type for putApiUserId */
export interface PutApiUserIdResponse {
  /** @description */
  200: UserVO;
}

export type PutApiUserIdResponseSuccess = PutApiUserIdResponse[200];
/** @tags User */
export const putApiUserId = /* #__PURE__ */ (() => {
  const method = "put";
  const url = "/api/user/:id";
  function request(
    option: PutApiUserIdOption
  ): Promise<PutApiUserIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PutApiUserIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for deleteApiUserId */
export interface DeleteApiUserIdOption {
  path: {
    id: string;
  };
}

/** @description response type for deleteApiUserId */
export interface DeleteApiUserIdResponse {
  /** @description */
  200: UserVO;
}

export type DeleteApiUserIdResponseSuccess = DeleteApiUserIdResponse[200];
/** @tags User */
export const deleteApiUserId = /* #__PURE__ */ (() => {
  const method = "delete";
  const url = "/api/user/:id";
  function request(
    option: DeleteApiUserIdOption
  ): Promise<DeleteApiUserIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<DeleteApiUserIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for postApiUser */
export interface PostApiUserOption {
  body: CreateUserDto;
}

/** @description response type for postApiUser */
export interface PostApiUserResponse {
  /** @description */
  201: UserVO;
}

export type PostApiUserResponseSuccess = PostApiUserResponse[201];
/** @tags User */
export const postApiUser = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/user";
  function request(
    option: PostApiUserOption
  ): Promise<PostApiUserResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostApiUserResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description response type for postApiUserRegister */
export interface PostApiUserRegisterResponse {
  /** @description */
  201: any;
}

export type PostApiUserRegisterResponseSuccess =
  PostApiUserRegisterResponse[201];
/** @tags User */
export const postApiUserRegister = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/user/register";
  function request(): Promise<PostApiUserRegisterResponseSuccess> {
    return requester(request.url, {
      method: request.method,
    }) as unknown as Promise<PostApiUserRegisterResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description response type for getApiAuth */
export interface GetApiAuthResponse {
  /** @description */
  200: string;
}

export type GetApiAuthResponseSuccess = GetApiAuthResponse[200];
/** @tags Auth */
export const getApiAuth = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/auth";
  function request(): Promise<GetApiAuthResponseSuccess> {
    return requester(request.url, {
      method: request.method,
    }) as unknown as Promise<GetApiAuthResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for postApiAuth */
export interface PostApiAuthOption {
  body: CreateAuthDto;
}

/** @description response type for postApiAuth */
export interface PostApiAuthResponse {
  /** @description */
  201: string;
}

export type PostApiAuthResponseSuccess = PostApiAuthResponse[201];
/** @tags Auth */
export const postApiAuth = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/auth";
  function request(
    option: PostApiAuthOption
  ): Promise<PostApiAuthResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostApiAuthResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiAuthId */
export interface GetApiAuthIdOption {
  path: {
    id: string;
  };
}

/** @description response type for getApiAuthId */
export interface GetApiAuthIdResponse {
  /** @description */
  200: string;
}

export type GetApiAuthIdResponseSuccess = GetApiAuthIdResponse[200];
/** @tags Auth */
export const getApiAuthId = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/auth/:id";
  function request(
    option: GetApiAuthIdOption
  ): Promise<GetApiAuthIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiAuthIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for deleteApiAuthId */
export interface DeleteApiAuthIdOption {
  path: {
    id: string;
  };
}

/** @description response type for deleteApiAuthId */
export interface DeleteApiAuthIdResponse {
  /** @description */
  200: string;
}

export type DeleteApiAuthIdResponseSuccess = DeleteApiAuthIdResponse[200];
/** @tags Auth */
export const deleteApiAuthId = /* #__PURE__ */ (() => {
  const method = "delete";
  const url = "/api/auth/:id";
  function request(
    option: DeleteApiAuthIdOption
  ): Promise<DeleteApiAuthIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<DeleteApiAuthIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for patchApiAuthId */
export interface PatchApiAuthIdOption {
  path: {
    id: string;
  };
}

/** @description request parameter type for patchApiAuthId */
export interface PatchApiAuthIdOption {
  body: UpdateAuthDto;
}

/** @description response type for patchApiAuthId */
export interface PatchApiAuthIdResponse {
  /** @description */
  200: string;
}

export type PatchApiAuthIdResponseSuccess = PatchApiAuthIdResponse[200];
/** @tags Auth */
export const patchApiAuthId = /* #__PURE__ */ (() => {
  const method = "patch";
  const url = "/api/auth/:id";
  function request(
    option: PatchApiAuthIdOption
  ): Promise<PatchApiAuthIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PatchApiAuthIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();
