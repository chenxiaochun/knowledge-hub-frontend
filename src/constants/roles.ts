/** 与后端 `RoleCode` 保持一致 */
export const RoleCode = {
  ADMIN: 'ROLE_ADMIN',
  REVIEWER: 'ROLE_REVIEWER',
  USER: 'ROLE_USER',
} as const;

export type RoleCodeValue = (typeof RoleCode)[keyof typeof RoleCode];

export const ROLE_OPTIONS: { label: string; value: RoleCodeValue }[] = [
  { label: '管理员', value: RoleCode.ADMIN },
  { label: '审核员', value: RoleCode.REVIEWER },
  { label: '普通用户', value: RoleCode.USER },
];

const ROLE_LABEL_MAP = Object.fromEntries(
  ROLE_OPTIONS.map((item) => [item.value, item.label]),
) as Record<string, string>;

export function getRoleLabel(code: string): string {
  return ROLE_LABEL_MAP[code] ?? code;
}
