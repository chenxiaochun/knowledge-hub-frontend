/* eslint-disable */
/* tslint:disable */
/** Do not modify manually.
content is generated automatically by `ts-gear`. */
import { request as requester } from "../../utils/request";
import type {
  UserVO,
  UpdateUserDto,
  CreateUserDto,
  PermissionEntity,
  RoleEntity,
  SetRolePermissionsDto,
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  SendResetCodeDto,
  ResetPasswordDto,
  UploadParseDto,
  DocumentReviewEntity,
  DocumentEntity,
  UpdateDocumentDto,
  GraphNodeHitDto,
  GraphSubgraphResultDto,
  GraphSubgraphNodeDto,
  GraphSubgraphEdgeDto,
  SearchDocumentsResultDto,
  SearchDocumentHitDto,
  SearchHighlightDto,
  SemanticSearchHitDto,
  CreateTeamDto,
  TeamEntity,
  UpdateTeamDto,
  RagSearchDto,
  RagChunkHitDto,
  ChatDto,
  ChatResponseDto,
  ChatSourceDto,
  SessionPageDto,
  AiSessionEntity,
  CreateSessionDto,
  AiMessageEntity,
  UpdateSessionDto,
  ChatStreamDto,
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

/** @description response type for getApiHealth */
export interface GetApiHealthResponse {
  /** @description */
  200: any;
}

export type GetApiHealthResponseSuccess = GetApiHealthResponse[200];
/** @tags App */
export const getApiHealth = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/health";
  function request(): Promise<GetApiHealthResponseSuccess> {
    return requester(request.url, {
      method: request.method,
    }) as unknown as Promise<GetApiHealthResponseSuccess>;
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

/** @description request parameter type for getApiRbacPage */
export interface GetApiRbacPageOption {
  query?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  };
}

/** @description response type for getApiRbacPage */
export interface GetApiRbacPageResponse {
  /** @description */
  200: any;
}

export type GetApiRbacPageResponseSuccess = GetApiRbacPageResponse[200];
/** @tags Rbac */
export const getApiRbacPage = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/rbac/page";
  function request(
    option?: GetApiRbacPageOption
  ): Promise<GetApiRbacPageResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiRbacPageResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description response type for getApiRbacPermissions */
export interface GetApiRbacPermissionsResponse {
  /** @description */
  200: Array<PermissionEntity>;
}

export type GetApiRbacPermissionsResponseSuccess =
  GetApiRbacPermissionsResponse[200];
/** @tags Rbac */
export const getApiRbacPermissions = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/rbac/permissions";
  function request(): Promise<GetApiRbacPermissionsResponseSuccess> {
    return requester(request.url, {
      method: request.method,
    }) as unknown as Promise<GetApiRbacPermissionsResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description response type for getApiRbacRoles */
export interface GetApiRbacRolesResponse {
  /** @description */
  200: Array<RoleEntity>;
}

export type GetApiRbacRolesResponseSuccess = GetApiRbacRolesResponse[200];
/** @tags Rbac */
export const getApiRbacRoles = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/rbac/roles";
  function request(): Promise<GetApiRbacRolesResponseSuccess> {
    return requester(request.url, {
      method: request.method,
    }) as unknown as Promise<GetApiRbacRolesResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description response type for getApiRbacRbacRoles */
export interface GetApiRbacRbacRolesResponse {
  /** @description */
  200: Array<RoleEntity>;
}

export type GetApiRbacRbacRolesResponseSuccess =
  GetApiRbacRbacRolesResponse[200];
/**
 * @description
 *   兼容旧路径
 * @tags Rbac
 */
export const getApiRbacRbacRoles = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/rbac/rbac/roles";
  function request(): Promise<GetApiRbacRbacRolesResponseSuccess> {
    return requester(request.url, {
      method: request.method,
    }) as unknown as Promise<GetApiRbacRbacRolesResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiRbacRolesRoleCodePermissions */
export interface GetApiRbacRolesRoleCodePermissionsOption {
  path: {
    roleCode: string;
  };
}

/** @description response type for getApiRbacRolesRoleCodePermissions */
export interface GetApiRbacRolesRoleCodePermissionsResponse {
  /** @description */
  200: any;
}

export type GetApiRbacRolesRoleCodePermissionsResponseSuccess =
  GetApiRbacRolesRoleCodePermissionsResponse[200];
/** @tags Rbac */
export const getApiRbacRolesRoleCodePermissions = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/rbac/roles/:roleCode/permissions";
  function request(
    option: GetApiRbacRolesRoleCodePermissionsOption
  ): Promise<GetApiRbacRolesRoleCodePermissionsResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiRbacRolesRoleCodePermissionsResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for putApiRbacRolesRoleCodePermissions */
export interface PutApiRbacRolesRoleCodePermissionsOption {
  path: {
    roleCode: string;
  };
}

/** @description request parameter type for putApiRbacRolesRoleCodePermissions */
export interface PutApiRbacRolesRoleCodePermissionsOption {
  body: SetRolePermissionsDto;
}

/** @description response type for putApiRbacRolesRoleCodePermissions */
export interface PutApiRbacRolesRoleCodePermissionsResponse {
  /** @description */
  200: any;
}

export type PutApiRbacRolesRoleCodePermissionsResponseSuccess =
  PutApiRbacRolesRoleCodePermissionsResponse[200];
/** @tags Rbac */
export const putApiRbacRolesRoleCodePermissions = /* #__PURE__ */ (() => {
  const method = "put";
  const url = "/api/rbac/roles/:roleCode/permissions";
  function request(
    option: PutApiRbacRolesRoleCodePermissionsOption
  ): Promise<PutApiRbacRolesRoleCodePermissionsResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PutApiRbacRolesRoleCodePermissionsResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for putApiRbacIdRoles */
export interface PutApiRbacIdRolesOption {
  path: {
    id: string;
  };
}

/** @description response type for putApiRbacIdRoles */
export interface PutApiRbacIdRolesResponse {
  /** @description */
  200: any;
}

export type PutApiRbacIdRolesResponseSuccess = PutApiRbacIdRolesResponse[200];
/** @tags Rbac */
export const putApiRbacIdRoles = /* #__PURE__ */ (() => {
  const method = "put";
  const url = "/api/rbac/:id/roles";
  function request(
    option: PutApiRbacIdRolesOption
  ): Promise<PutApiRbacIdRolesResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PutApiRbacIdRolesResponseSuccess>;
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

/** @description request parameter type for getApiAuthVerifyEmail */
export interface GetApiAuthVerifyEmailOption {
  query: {
    token: string;
  };
}

/** @description response type for getApiAuthVerifyEmail */
export interface GetApiAuthVerifyEmailResponse {
  /** @description */
  200: any;
}

export type GetApiAuthVerifyEmailResponseSuccess =
  GetApiAuthVerifyEmailResponse[200];
/** @tags Auth */
export const getApiAuthVerifyEmail = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/auth/verify-email";
  function request(
    option: GetApiAuthVerifyEmailOption
  ): Promise<GetApiAuthVerifyEmailResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiAuthVerifyEmailResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for postApiAuthPasswordResetSendCode */
export interface PostApiAuthPasswordResetSendCodeOption {
  body: SendResetCodeDto;
}

/** @description response type for postApiAuthPasswordResetSendCode */
export interface PostApiAuthPasswordResetSendCodeResponse {
  /** @description */
  201: any;
}

export type PostApiAuthPasswordResetSendCodeResponseSuccess =
  PostApiAuthPasswordResetSendCodeResponse[201];
/** @tags Auth */
export const postApiAuthPasswordResetSendCode = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/auth/password/reset/send-code";
  function request(
    option: PostApiAuthPasswordResetSendCodeOption
  ): Promise<PostApiAuthPasswordResetSendCodeResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostApiAuthPasswordResetSendCodeResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for postApiAuthPasswordReset */
export interface PostApiAuthPasswordResetOption {
  body: ResetPasswordDto;
}

/** @description response type for postApiAuthPasswordReset */
export interface PostApiAuthPasswordResetResponse {
  /** @description */
  201: any;
}

export type PostApiAuthPasswordResetResponseSuccess =
  PostApiAuthPasswordResetResponse[201];
/** @tags Auth */
export const postApiAuthPasswordReset = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/auth/password/reset";
  function request(
    option: PostApiAuthPasswordResetOption
  ): Promise<PostApiAuthPasswordResetResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostApiAuthPasswordResetResponseSuccess>;
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
 *   静态路径须在 :id 之前
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

/** @description response type for getApiDocumentReviewsPending */
export interface GetApiDocumentReviewsPendingResponse {
  /** @description */
  200: Array<DocumentReviewEntity>;
}

export type GetApiDocumentReviewsPendingResponseSuccess =
  GetApiDocumentReviewsPendingResponse[200];
/** @tags Document */
export const getApiDocumentReviewsPending = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/document/reviews/pending";
  function request(): Promise<GetApiDocumentReviewsPendingResponseSuccess> {
    return requester(request.url, {
      method: request.method,
    }) as unknown as Promise<GetApiDocumentReviewsPendingResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for putApiDocumentReviewsReviewIdApprove */
export interface PutApiDocumentReviewsReviewIdApproveOption {
  path: {
    reviewId: string;
  };
}

/** @description response type for putApiDocumentReviewsReviewIdApprove */
export interface PutApiDocumentReviewsReviewIdApproveResponse {
  /** @description */
  200: DocumentEntity;
}

export type PutApiDocumentReviewsReviewIdApproveResponseSuccess =
  PutApiDocumentReviewsReviewIdApproveResponse[200];
/** @tags Document */
export const putApiDocumentReviewsReviewIdApprove = /* #__PURE__ */ (() => {
  const method = "put";
  const url = "/api/document/reviews/:reviewId/approve";
  function request(
    option: PutApiDocumentReviewsReviewIdApproveOption
  ): Promise<PutApiDocumentReviewsReviewIdApproveResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PutApiDocumentReviewsReviewIdApproveResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for putApiDocumentReviewsReviewIdReject */
export interface PutApiDocumentReviewsReviewIdRejectOption {
  path: {
    reviewId: string;
  };
}

/** @description response type for putApiDocumentReviewsReviewIdReject */
export interface PutApiDocumentReviewsReviewIdRejectResponse {
  /** @description */
  200: DocumentEntity;
}

export type PutApiDocumentReviewsReviewIdRejectResponseSuccess =
  PutApiDocumentReviewsReviewIdRejectResponse[200];
/** @tags Document */
export const putApiDocumentReviewsReviewIdReject = /* #__PURE__ */ (() => {
  const method = "put";
  const url = "/api/document/reviews/:reviewId/reject";
  function request(
    option: PutApiDocumentReviewsReviewIdRejectOption
  ): Promise<PutApiDocumentReviewsReviewIdRejectResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PutApiDocumentReviewsReviewIdRejectResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for putApiDocumentIdSubmitReview */
export interface PutApiDocumentIdSubmitReviewOption {
  path: {
    id: string;
  };
}

/** @description response type for putApiDocumentIdSubmitReview */
export interface PutApiDocumentIdSubmitReviewResponse {
  /** @description */
  200: any;
}

export type PutApiDocumentIdSubmitReviewResponseSuccess =
  PutApiDocumentIdSubmitReviewResponse[200];
/** @tags Document */
export const putApiDocumentIdSubmitReview = /* #__PURE__ */ (() => {
  const method = "put";
  const url = "/api/document/:id/submit-review";
  function request(
    option: PutApiDocumentIdSubmitReviewOption
  ): Promise<PutApiDocumentIdSubmitReviewResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PutApiDocumentIdSubmitReviewResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for putApiDocumentIdArchive */
export interface PutApiDocumentIdArchiveOption {
  path: {
    id: string;
  };
}

/** @description response type for putApiDocumentIdArchive */
export interface PutApiDocumentIdArchiveResponse {
  /** @description */
  200: DocumentEntity;
}

export type PutApiDocumentIdArchiveResponseSuccess =
  PutApiDocumentIdArchiveResponse[200];
/** @tags Document */
export const putApiDocumentIdArchive = /* #__PURE__ */ (() => {
  const method = "put";
  const url = "/api/document/:id/archive";
  function request(
    option: PutApiDocumentIdArchiveOption
  ): Promise<PutApiDocumentIdArchiveResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PutApiDocumentIdArchiveResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for putApiDocumentIdSaveAsDraft */
export interface PutApiDocumentIdSaveAsDraftOption {
  path: {
    id: string;
  };
}

/** @description response type for putApiDocumentIdSaveAsDraft */
export interface PutApiDocumentIdSaveAsDraftResponse {
  /** @description */
  200: DocumentEntity;
}

export type PutApiDocumentIdSaveAsDraftResponseSuccess =
  PutApiDocumentIdSaveAsDraftResponse[200];
/** @tags Document */
export const putApiDocumentIdSaveAsDraft = /* #__PURE__ */ (() => {
  const method = "put";
  const url = "/api/document/:id/save-as-draft";
  function request(
    option: PutApiDocumentIdSaveAsDraftOption
  ): Promise<PutApiDocumentIdSaveAsDraftResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PutApiDocumentIdSaveAsDraftResponseSuccess>;
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

/** @description request parameter type for putApiDocumentId */
export interface PutApiDocumentIdOption {
  path: {
    id: string;
  };
}

/** @description request parameter type for putApiDocumentId */
export interface PutApiDocumentIdOption {
  body: UpdateDocumentDto;
}

/** @description response type for putApiDocumentId */
export interface PutApiDocumentIdResponse {
  /** @description */
  200: DocumentEntity;
}

export type PutApiDocumentIdResponseSuccess = PutApiDocumentIdResponse[200];
/** @tags Document */
export const putApiDocumentId = /* #__PURE__ */ (() => {
  const method = "put";
  const url = "/api/document/:id";
  function request(
    option: PutApiDocumentIdOption
  ): Promise<PutApiDocumentIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PutApiDocumentIdResponseSuccess>;
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

/** @description request parameter type for getApiGraphSearch */
export interface GetApiGraphSearchOption {
  query: {
    keyword: string;
    limit?: number;
  };
}

/** @description response type for getApiGraphSearch */
export interface GetApiGraphSearchResponse {
  /** @description */
  200: Array<GraphNodeHitDto>;
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

/** @description request parameter type for getApiGraphSearchSubgraph */
export interface GetApiGraphSearchSubgraphOption {
  query: {
    keyword: string;
    limit?: number;
  };
}

/** @description response type for getApiGraphSearchSubgraph */
export interface GetApiGraphSearchSubgraphResponse {
  /** @description */
  200: GraphSubgraphResultDto;
}

export type GetApiGraphSearchSubgraphResponseSuccess =
  GetApiGraphSearchSubgraphResponse[200];
/** @tags Graph */
export const getApiGraphSearchSubgraph = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/graph/search/subgraph";
  function request(
    option: GetApiGraphSearchSubgraphOption
  ): Promise<GetApiGraphSearchSubgraphResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiGraphSearchSubgraphResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiGraphOverview */
export interface GetApiGraphOverviewOption {
  query: {
    keyword: string;
    entityType: string;
    from: string;
    to: string;
    docLimit?: number;
  };
}

/** @description response type for getApiGraphOverview */
export interface GetApiGraphOverviewResponse {
  /** @description */
  200: any;
}

export type GetApiGraphOverviewResponseSuccess =
  GetApiGraphOverviewResponse[200];
/**
 * @description
 *   全景：文档 / 实体 / 标签 + 统计，供前端力导向图
 * @tags Graph
 */
export const getApiGraphOverview = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/graph/overview";
  function request(
    option: GetApiGraphOverviewOption
  ): Promise<GetApiGraphOverviewResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiGraphOverviewResponseSuccess>;
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
  200: SearchDocumentsResultDto;
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
  200: Array<SemanticSearchHitDto>;
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

/** @description request parameter type for postApiTeams */
export interface PostApiTeamsOption {
  body: CreateTeamDto;
}

/** @description response type for postApiTeams */
export interface PostApiTeamsResponse {
  /** @description */
  201: TeamEntity;
}

export type PostApiTeamsResponseSuccess = PostApiTeamsResponse[201];
/** @tags Team */
export const postApiTeams = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/teams";
  function request(
    option: PostApiTeamsOption
  ): Promise<PostApiTeamsResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostApiTeamsResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiTeamsId */
export interface GetApiTeamsIdOption {
  path: {
    id: string;
  };
}

/** @description response type for getApiTeamsId */
export interface GetApiTeamsIdResponse {
  /** @description */
  200: TeamEntity;
}

export type GetApiTeamsIdResponseSuccess = GetApiTeamsIdResponse[200];
/** @tags Team */
export const getApiTeamsId = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/teams/:id";
  function request(
    option: GetApiTeamsIdOption
  ): Promise<GetApiTeamsIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiTeamsIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for putApiTeamsId */
export interface PutApiTeamsIdOption {
  path: {
    id: string;
  };
}

/** @description request parameter type for putApiTeamsId */
export interface PutApiTeamsIdOption {
  body: UpdateTeamDto;
}

/** @description response type for putApiTeamsId */
export interface PutApiTeamsIdResponse {
  /** @description */
  200: TeamEntity;
}

export type PutApiTeamsIdResponseSuccess = PutApiTeamsIdResponse[200];
/** @tags Team */
export const putApiTeamsId = /* #__PURE__ */ (() => {
  const method = "put";
  const url = "/api/teams/:id";
  function request(
    option: PutApiTeamsIdOption
  ): Promise<PutApiTeamsIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PutApiTeamsIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for deleteApiTeamsId */
export interface DeleteApiTeamsIdOption {
  path: {
    id: string;
  };
}

/** @description response type for deleteApiTeamsId */
export interface DeleteApiTeamsIdResponse {
  /** @description */
  200: any;
}

export type DeleteApiTeamsIdResponseSuccess = DeleteApiTeamsIdResponse[200];
/** @tags Team */
export const deleteApiTeamsId = /* #__PURE__ */ (() => {
  const method = "delete";
  const url = "/api/teams/:id";
  function request(
    option: DeleteApiTeamsIdOption
  ): Promise<DeleteApiTeamsIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<DeleteApiTeamsIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiTeamsPage */
export interface GetApiTeamsPageOption {
  query?: {
    keyword?: string;
    status?: number;
    page?: number;
    pageSize?: number;
  };
}

/** @description response type for getApiTeamsPage */
export interface GetApiTeamsPageResponse {
  /** @description */
  200: any;
}

export type GetApiTeamsPageResponseSuccess = GetApiTeamsPageResponse[200];
/** @tags Team */
export const getApiTeamsPage = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/teams/page";
  function request(
    option?: GetApiTeamsPageOption
  ): Promise<GetApiTeamsPageResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiTeamsPageResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiTeamsTree */
export interface GetApiTeamsTreeOption {
  query?: {
    rootOnly?: string;
  };
}

/** @description response type for getApiTeamsTree */
export interface GetApiTeamsTreeResponse {
  /** @description */
  200: Array<TeamEntity>;
}

export type GetApiTeamsTreeResponseSuccess = GetApiTeamsTreeResponse[200];
/** @tags Team */
export const getApiTeamsTree = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/teams/tree";
  function request(
    option?: GetApiTeamsTreeOption
  ): Promise<GetApiTeamsTreeResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiTeamsTreeResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for postApiAiRagSearch */
export interface PostApiAiRagSearchOption {
  body: RagSearchDto;
}

/** @description response type for postApiAiRagSearch */
export interface PostApiAiRagSearchResponse {
  /** @description */
  201: Array<RagChunkHitDto>;
}

export type PostApiAiRagSearchResponseSuccess = PostApiAiRagSearchResponse[201];
/** @tags Ai */
export const postApiAiRagSearch = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/ai/rag/search";
  function request(
    option: PostApiAiRagSearchOption
  ): Promise<PostApiAiRagSearchResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostApiAiRagSearchResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for postApiAiChat */
export interface PostApiAiChatOption {
  body: ChatDto;
}

/** @description response type for postApiAiChat */
export interface PostApiAiChatResponse {
  /** @description */
  201: ChatResponseDto;
}

export type PostApiAiChatResponseSuccess = PostApiAiChatResponse[201];
/** @tags Ai */
export const postApiAiChat = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/ai/chat";
  function request(
    option: PostApiAiChatOption
  ): Promise<PostApiAiChatResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostApiAiChatResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiAiSessions */
export interface GetApiAiSessionsOption {
  query?: {
    page?: number;
    pageSize?: number;
  };
}

/** @description response type for getApiAiSessions */
export interface GetApiAiSessionsResponse {
  /** @description */
  200: SessionPageDto;
}

export type GetApiAiSessionsResponseSuccess = GetApiAiSessionsResponse[200];
/** @tags Ai */
export const getApiAiSessions = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/ai/sessions";
  function request(
    option?: GetApiAiSessionsOption
  ): Promise<GetApiAiSessionsResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiAiSessionsResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for postApiAiSessions */
export interface PostApiAiSessionsOption {
  body: CreateSessionDto;
}

/** @description response type for postApiAiSessions */
export interface PostApiAiSessionsResponse {
  /** @description */
  201: AiSessionEntity;
}

export type PostApiAiSessionsResponseSuccess = PostApiAiSessionsResponse[201];
/** @tags Ai */
export const postApiAiSessions = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/ai/sessions";
  function request(
    option: PostApiAiSessionsOption
  ): Promise<PostApiAiSessionsResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostApiAiSessionsResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for getApiAiSessionsIdMessages */
export interface GetApiAiSessionsIdMessagesOption {
  path: {
    id: string;
  };
}

/** @description response type for getApiAiSessionsIdMessages */
export interface GetApiAiSessionsIdMessagesResponse {
  /** @description */
  200: Array<AiMessageEntity>;
}

export type GetApiAiSessionsIdMessagesResponseSuccess =
  GetApiAiSessionsIdMessagesResponse[200];
/** @tags Ai */
export const getApiAiSessionsIdMessages = /* #__PURE__ */ (() => {
  const method = "get";
  const url = "/api/ai/sessions/:id/messages";
  function request(
    option: GetApiAiSessionsIdMessagesOption
  ): Promise<GetApiAiSessionsIdMessagesResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<GetApiAiSessionsIdMessagesResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for deleteApiAiSessionsId */
export interface DeleteApiAiSessionsIdOption {
  path: {
    id: string;
  };
}

/** @description response type for deleteApiAiSessionsId */
export interface DeleteApiAiSessionsIdResponse {
  /** @description */
  200: any;
}

export type DeleteApiAiSessionsIdResponseSuccess =
  DeleteApiAiSessionsIdResponse[200];
/** @tags Ai */
export const deleteApiAiSessionsId = /* #__PURE__ */ (() => {
  const method = "delete";
  const url = "/api/ai/sessions/:id";
  function request(
    option: DeleteApiAiSessionsIdOption
  ): Promise<DeleteApiAiSessionsIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<DeleteApiAiSessionsIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for patchApiAiSessionsId */
export interface PatchApiAiSessionsIdOption {
  path: {
    id: string;
  };
}

/** @description request parameter type for patchApiAiSessionsId */
export interface PatchApiAiSessionsIdOption {
  body: UpdateSessionDto;
}

/** @description response type for patchApiAiSessionsId */
export interface PatchApiAiSessionsIdResponse {
  /** @description */
  200: AiSessionEntity;
}

export type PatchApiAiSessionsIdResponseSuccess =
  PatchApiAiSessionsIdResponse[200];
/** @tags Ai */
export const patchApiAiSessionsId = /* #__PURE__ */ (() => {
  const method = "patch";
  const url = "/api/ai/sessions/:id";
  function request(
    option: PatchApiAiSessionsIdOption
  ): Promise<PatchApiAiSessionsIdResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PatchApiAiSessionsIdResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();

/** @description request parameter type for postApiAiChatStream */
export interface PostApiAiChatStreamOption {
  body: ChatStreamDto;
}

/** @description response type for postApiAiChatStream */
export interface PostApiAiChatStreamResponse {
  /** @description */
  201: any;
}

export type PostApiAiChatStreamResponseSuccess =
  PostApiAiChatStreamResponse[201];
/** @tags Ai */
export const postApiAiChatStream = /* #__PURE__ */ (() => {
  const method = "post";
  const url = "/api/ai/chat/stream";
  function request(
    option: PostApiAiChatStreamOption
  ): Promise<PostApiAiChatStreamResponseSuccess> {
    return requester(request.url, {
      method: request.method,
      ...option,
    }) as unknown as Promise<PostApiAiChatStreamResponseSuccess>;
  }

  /** http method */
  request.method = method;
  /** request url */
  request.url = url;
  return request;
})();
