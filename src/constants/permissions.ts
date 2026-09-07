/** 与后端 `PermissionCode` / `PermissionName` 保持一致（固定权限资源码） */
export const PermissionCode = {
  systemUser: 'system:user',
  documentList: 'document:list',
  documentCreate: 'document:create',
  documentReview: 'document:review',
  search: 'search',
} as const;

export type PermissionCodeValue = (typeof PermissionCode)[keyof typeof PermissionCode];

export const PERMISSION_OPTIONS: {
  label: string;
  value: PermissionCodeValue;
  description?: string;
}[] = [
  { label: '系统用户', value: PermissionCode.systemUser, description: '用户与角色权限管理' },
  { label: '文档列表', value: PermissionCode.documentList, description: '查看文档列表与详情' },
  { label: '文档创建', value: PermissionCode.documentCreate, description: '上传与创建文档' },
  { label: '文档审核', value: PermissionCode.documentReview, description: '发布 / 审核文档' },
  { label: '搜索', value: PermissionCode.search, description: '全文 / 语义 / 图谱检索' },
];

const PERMISSION_LABEL_MAP = Object.fromEntries(
  PERMISSION_OPTIONS.map((item) => [item.value, item.label]),
) as Record<string, string>;

export function getPermissionLabel(code: string): string {
  return PERMISSION_LABEL_MAP[code] ?? code;
}
