/* eslint-disable */
/* tslint:disable */
/** Do not modify manually.
content is generated automatically by `ts-gear`. */
import { request as requester } from "../../utils/request";
import type {
  UserVO,
  UpdateUserDto,
  CreateUserDto,
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  UploadParseDto,
  DocumentEntity,
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

/** @description request parameter type for postApiAuthRegister */
export interface PostApiAuthRegisterOption {
  body: RegisterDto;
}

/** @description response type for postApiAuthRegister */
export interface PostApiAuthRegisterResponse {
  /** @description */
  201: any;
}

export type PostApiAuthRegisterResponseSuccess =
  PostApiAuthRegisterResponse[201];
/** @tags Auth */
export const postApiAuthRegister = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/auth/register";
  function request(
    option: PostApiAuthRegisterOption
  ): Promise<PostApiAuthRegisterResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostApiAuthRegisterResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for postApiAuthLogin */
export interface PostApiAuthLoginOption {
  body: LoginDto;
}

/** @description response type for postApiAuthLogin */
export interface PostApiAuthLoginResponse {
  /** @description */
  201: any;
}

export type PostApiAuthLoginResponseSuccess = PostApiAuthLoginResponse[201];
/** @tags Auth */
export const postApiAuthLogin = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/auth/login";
  function request(
    option: PostApiAuthLoginOption
  ): Promise<PostApiAuthLoginResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostApiAuthLoginResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for postApiAuthRefresh */
export interface PostApiAuthRefreshOption {
  body: RefreshTokenDto;
}

/** @description response type for postApiAuthRefresh */
export interface PostApiAuthRefreshResponse {
  /** @description */
  201: any;
}

export type PostApiAuthRefreshResponseSuccess = PostApiAuthRefreshResponse[201];
/** @tags Auth */
export const postApiAuthRefresh = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/auth/refresh";
  function request(
    option: PostApiAuthRefreshOption
  ): Promise<PostApiAuthRefreshResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostApiAuthRefreshResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description response type for postApiAuthLogout */
export interface PostApiAuthLogoutResponse {
  /** @description */
  201: any;
}

export type PostApiAuthLogoutResponseSuccess = PostApiAuthLogoutResponse[201];
/** @tags Auth */
export const postApiAuthLogout = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/auth/logout";
  function request(): Promise<PostApiAuthLogoutResponseSuccess> {
    return requester(request.url, {
      method: request.method,
    }) as unknown as Promise<PostApiAuthLogoutResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description response type for getApiAuthMe */
export interface GetApiAuthMeResponse {
  /** @description */
  200: UserVO;
}

export type GetApiAuthMeResponseSuccess = GetApiAuthMeResponse[200];
/** @tags Auth */
export const getApiAuthMe = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/auth/me";
  function request(): Promise<GetApiAuthMeResponseSuccess> {
    return requester(request.url, {
      method: request.method,
    }) as unknown as Promise<GetApiAuthMeResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for postApiDocumentUploadParse */
export interface PostApiDocumentUploadParseOption {
  body: UploadParseDto;
}

/** @description response type for postApiDocumentUploadParse */
export interface PostApiDocumentUploadParseResponse {
  /** @description */
  201: any;
}

export type PostApiDocumentUploadParseResponseSuccess =
  PostApiDocumentUploadParseResponse[201];
/** @tags Document */
export const postApiDocumentUploadParse = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/document/upload/parse";
  function request(
    option: PostApiDocumentUploadParseOption
  ): Promise<PostApiDocumentUploadParseResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostApiDocumentUploadParseResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiDocument */
export interface GetApiDocumentOption {
  query?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  };
}

/** @description response type for getApiDocument */
export interface GetApiDocumentResponse {
  /** @description */
  200: any;
}

export type GetApiDocumentResponseSuccess = GetApiDocumentResponse[200];
/**
 * @description
 *   列表须在 :id 之前
 * @tags Document
 */
export const getApiDocument = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/document";
  function request(
    option?: GetApiDocumentOption
  ): Promise<GetApiDocumentResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiDocumentResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiDocumentId */
export interface GetApiDocumentIdOption {
  path: {
    id: string;
  };
}

/** @description response type for getApiDocumentId */
export interface GetApiDocumentIdResponse {
  /** @description */
  200: any;
}

export type GetApiDocumentIdResponseSuccess = GetApiDocumentIdResponse[200];
/** @tags Document */
export const getApiDocumentId = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/document/:id";
  function request(
    option: GetApiDocumentIdOption
  ): Promise<GetApiDocumentIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiDocumentIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for deleteApiDocumentId */
export interface DeleteApiDocumentIdOption {
  path: {
    id: string;
  };
}

/** @description response type for deleteApiDocumentId */
export interface DeleteApiDocumentIdResponse {
  /** @description */
  200: any;
}

export type DeleteApiDocumentIdResponseSuccess =
  DeleteApiDocumentIdResponse[200];
/** @tags Document */
export const deleteApiDocumentId = /* #__PURE__ */ (() => {
  const method = "delete";
  const url = "/api/document/:id";
  function request(
    option: DeleteApiDocumentIdOption
  ): Promise<DeleteApiDocumentIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<DeleteApiDocumentIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for putApiDocumentIdPublish */
export interface PutApiDocumentIdPublishOption {
  path: {
    id: string;
  };
}

/** @description response type for putApiDocumentIdPublish */
export interface PutApiDocumentIdPublishResponse {
  /** @description */
  200: DocumentEntity;
}

export type PutApiDocumentIdPublishResponseSuccess =
  PutApiDocumentIdPublishResponse[200];
/** @tags Document */
export const putApiDocumentIdPublish = /* #__PURE__ */ (() => {
  const method = "put";
  const url = "/api/document/:id/publish";
  function request(
    option: PutApiDocumentIdPublishOption
  ): Promise<PutApiDocumentIdPublishResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PutApiDocumentIdPublishResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiSearch */
export interface GetApiSearchOption {
  query: {
    keyword: string;
    page?: number;
    pageSize?: number;
  };
}

/** @description response type for getApiSearch */
export interface GetApiSearchResponse {
  /** @description */
  200: any;
}

export type GetApiSearchResponseSuccess = GetApiSearchResponse[200];
/** @tags Search */
export const getApiSearch = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/search";
  function request(
    option: GetApiSearchOption
  ): Promise<GetApiSearchResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiSearchResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiSearchSemantic */
export interface GetApiSearchSemanticOption {
  query: {
    query: string;
    topK?: number;
  };
}

/** @description response type for getApiSearchSemantic */
export interface GetApiSearchSemanticResponse {
  /** @description */
  200: any;
}

export type GetApiSearchSemanticResponseSuccess =
  GetApiSearchSemanticResponse[200];
/** @tags Search */
export const getApiSearchSemantic = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/search/semantic";
  function request(
    option: GetApiSearchSemanticOption
  ): Promise<GetApiSearchSemanticResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiSearchSemanticResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiGraphSearch */
export interface GetApiGraphSearchOption {
  query: {
    keyword: string;
    limit?: string;
  };
}

/** @description response type for getApiGraphSearch */
export interface GetApiGraphSearchResponse {
  /** @description */
  200: any;
}

export type GetApiGraphSearchResponseSuccess = GetApiGraphSearchResponse[200];
/** @tags Graph */
export const getApiGraphSearch = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/graph/search";
  function request(
    option: GetApiGraphSearchOption
  ): Promise<GetApiGraphSearchResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiGraphSearchResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();
