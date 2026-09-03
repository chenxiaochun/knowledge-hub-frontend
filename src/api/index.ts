/**
 * API 模块入口
 * 按业务拆分文件后在此统一导出，例如：
 * export * from './user'
 * export * from './knowledge'
 */

export { get, post, put, del } from '@/utils/request';
export type { ApiResponse } from '@/utils/request';
