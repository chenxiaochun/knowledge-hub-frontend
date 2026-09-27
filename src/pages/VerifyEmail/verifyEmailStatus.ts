import type { AxiosError } from 'axios';

import type { ApiResponse } from '@/utils/request';

export type VerifyEmailStatus = 'ready' | 'loading' | 'success' | 'already' | 'invalid' | 'error';

export function resolveVerifyEmailError(error: unknown): {
  status: Exclude<VerifyEmailStatus, 'ready' | 'loading' | 'success'>;
  message: string;
} {
  const axiosError = error as AxiosError<ApiResponse | { message?: string }>;
  const responseMessage = axiosError.response?.data?.message;
  const message =
    (typeof responseMessage === 'string' ? responseMessage : '') ||
    (error instanceof Error ? error.message : '') ||
    '激活失败，请稍后重试';

  if (/已激活|already/i.test(message)) {
    return { status: 'already', message };
  }

  if (/无效|过期|invalid|expired/i.test(message)) {
    return { status: 'invalid', message };
  }

  return { status: 'error', message };
}
