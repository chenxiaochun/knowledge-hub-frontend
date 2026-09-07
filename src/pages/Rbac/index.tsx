import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Checkbox, Empty, List, Space, Tag, Typography, message } from 'antd';
import {
  getApiRbacPermissions,
  getApiRbacRoles,
  getApiRbacRolesRoleCodePermissions,
  putApiRbacRolesRoleCodePermissions,
  type PermissionEntity,
  type RoleEntity,
} from '@/service/api';
import { getRoleLabel, ROLE_OPTIONS, RoleCode } from '@/constants/roles';
import {
  getPermissionLabel,
  PERMISSION_OPTIONS,
  type PermissionCodeValue,
} from '@/constants/permissions';
import { getUserInfo } from '@/utils/auth';

type RolePermResult = {
  roleCode: string;
  permissionCodes: string[];
};

const FIXED_ROLE_ORDER = ROLE_OPTIONS.map((item) => item.value);

export default function RbacPage() {
  const user = getUserInfo();
  const isAdmin = Boolean(user?.roles?.includes(RoleCode.ADMIN));

  const [rolesLoading, setRolesLoading] = useState(false);
  const [permLoading, setPermLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<RoleEntity[]>([]);
  const [permissions, setPermissions] = useState<PermissionEntity[]>([]);
  const [selectedRoleCode, setSelectedRoleCode] = useState<string | null>(null);
  const [checkedCodes, setCheckedCodes] = useState<string[]>([]);
  const [savedCodes, setSavedCodes] = useState<string[]>([]);

  const sortedRoles = useMemo(() => {
    const map = new Map(roles.map((role) => [role.roleCode, role]));
    const ordered = FIXED_ROLE_ORDER.map((code) => map.get(code)).filter(
      (role): role is RoleEntity => Boolean(role),
    );
    const extras = roles.filter(
      (role) => !(FIXED_ROLE_ORDER as readonly string[]).includes(role.roleCode),
    );
    return [...ordered, ...extras];
  }, [roles]);

  const permissionOptions = useMemo(() => {
    if (!permissions.length) return PERMISSION_OPTIONS;
    const known = new Set(PERMISSION_OPTIONS.map((item) => item.value));
    const fromApi = permissions.map((item) => ({
      label: item.permissionName || getPermissionLabel(item.permissionCode),
      value: item.permissionCode as PermissionCodeValue,
      description: undefined as string | undefined,
    }));
    // 固定常量优先，API 多出的码追加在后
    const extras = fromApi.filter((item) => !known.has(item.value as PermissionCodeValue));
    return [...PERMISSION_OPTIONS, ...extras];
  }, [permissions]);

  const dirty = useMemo(() => {
    const a = [...checkedCodes].sort().join(',');
    const b = [...savedCodes].sort().join(',');
    return a !== b;
  }, [checkedCodes, savedCodes]);

  const loadRolesAndPermissions = useCallback(async () => {
    setRolesLoading(true);
    try {
      const [roleList, permList] = await Promise.all([
        getApiRbacRoles(),
        getApiRbacPermissions(),
      ]);
      setRoles(roleList ?? []);
      setPermissions(permList ?? []);
      setSelectedRoleCode((prev) => {
        if (prev) return prev;
        return (
          FIXED_ROLE_ORDER.find((code) => (roleList ?? []).some((role) => role.roleCode === code)) ??
          roleList?.[0]?.roleCode ??
          null
        );
      });
    } catch {
      // 错误已由拦截器提示
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const loadRolePermissions = useCallback(async (roleCode: string) => {
    setPermLoading(true);
    try {
      const res = (await getApiRbacRolesRoleCodePermissions({
        path: { roleCode },
      })) as RolePermResult;
      const codes = res.permissionCodes ?? [];
      setCheckedCodes(codes);
      setSavedCodes(codes);
    } catch {
      setCheckedCodes([]);
      setSavedCodes([]);
    } finally {
      setPermLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRolesAndPermissions();
  }, [loadRolesAndPermissions]);

  useEffect(() => {
    if (!selectedRoleCode) return;
    void loadRolePermissions(selectedRoleCode);
  }, [loadRolePermissions, selectedRoleCode]);

  const handleSave = async () => {
    if (!selectedRoleCode) return;
    setSaving(true);
    try {
      await putApiRbacRolesRoleCodePermissions({
        path: { roleCode: selectedRoleCode },
        body: { permissionCodes: checkedCodes },
      });
      setSavedCodes(checkedCodes);
      message.success('权限已保存');
    } catch {
      // 错误已由拦截器提示
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCheckedCodes(savedCodes);
  };

  if (!isAdmin) {
    return (
      <Alert
        type="warning"
        showIcon
        message="无访问权限"
        description="角色权限配置仅管理员可访问。"
      />
    );
  }

  const selectedRole = sortedRoles.find((role) => role.roleCode === selectedRoleCode);

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        角色权限
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        角色与权限资源码均为系统预置；在此为每个角色勾选可访问的权限码。
      </Typography.Paragraph>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 280px) 1fr',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <Card title="角色" size="small" loading={rolesLoading}>
          {sortedRoles.length ? (
            <List
              dataSource={sortedRoles}
              renderItem={(role) => {
                const active = role.roleCode === selectedRoleCode;
                return (
                  <List.Item
                    style={{
                      cursor: 'pointer',
                      background: active ? '#e6f4ff' : undefined,
                      borderRadius: 6,
                      paddingInline: 12,
                    }}
                    onClick={() => {
                      if (dirty && role.roleCode !== selectedRoleCode) {
                        message.warning('请先保存或重置当前角色的修改');
                        return;
                      }
                      setSelectedRoleCode(role.roleCode);
                    }}
                  >
                    <Space direction="vertical" size={0}>
                      <Typography.Text strong>
                        {role.roleName || getRoleLabel(role.roleCode)}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {role.roleCode}
                      </Typography.Text>
                    </Space>
                  </List.Item>
                );
              }}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无角色" />
          )}
        </Card>

        <Card
          title={
            selectedRole
              ? `权限配置 · ${selectedRole.roleName || getRoleLabel(selectedRole.roleCode)}`
              : '权限配置'
          }
          size="small"
          loading={permLoading}
          extra={
            selectedRoleCode ? (
              <Space>
                {dirty ? <Tag color="orange">未保存</Tag> : <Tag>已同步</Tag>}
                <Button onClick={handleReset} disabled={!dirty || saving}>
                  重置
                </Button>
                <Button type="primary" loading={saving} disabled={!dirty} onClick={() => void handleSave()}>
                  保存
                </Button>
              </Space>
            ) : null
          }
        >
          {!selectedRoleCode ? (
            <Empty description="请选择左侧角色" />
          ) : (
            <Checkbox.Group
              style={{ width: '100%' }}
              value={checkedCodes}
              onChange={(values) => setCheckedCodes(values as string[])}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {permissionOptions.map((item) => (
                  <label
                    key={item.value}
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      padding: '8px 12px',
                      border: '1px solid #f0f0f0',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <Checkbox value={item.value} style={{ marginTop: 2 }} />
                    <Space direction="vertical" size={0}>
                      <Space wrap>
                        <Typography.Text strong>{item.label}</Typography.Text>
                        <Typography.Text type="secondary" code>
                          {item.value}
                        </Typography.Text>
                      </Space>
                      {item.description ? (
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {item.description}
                        </Typography.Text>
                      ) : null}
                    </Space>
                  </label>
                ))}
              </Space>
            </Checkbox.Group>
          )}
        </Card>
      </div>
    </div>
  );
}
