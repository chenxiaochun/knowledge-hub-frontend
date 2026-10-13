import { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert, Button, Checkbox, List, Space, Tag, Typography, message } from 'antd';

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
  const permissionHeader = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span>
        {selectedRole
          ? `权限配置 · ${selectedRole.roleName || getRoleLabel(selectedRole.roleCode)}`
          : '权限配置'}
      </span>
      {selectedRoleCode ? (
        <Space>
          {dirty ? <Tag color="orange">未保存</Tag> : <Tag>已同步</Tag>}
          <Button onClick={handleReset} disabled={!dirty || saving}>
            重置
          </Button>
          <Button type="primary" loading={saving} disabled={!dirty} onClick={() => void handleSave()}>
            保存
          </Button>
        </Space>
      ) : null}
    </div>
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 280px) 1fr',
        gap: 16,
        alignItems: 'start',
      }}
    >
        <List
          header="角色"
          bordered
          size="small"
          loading={rolesLoading}
          dataSource={sortedRoles}
          locale={{ emptyText: '暂无角色' }}
          rowKey="roleCode"
          renderItem={(role) => {
            const active = role.roleCode === selectedRoleCode;
            return (
              <List.Item
                style={{
                  cursor: 'pointer',
                  background: active ? '#e6f4ff' : undefined,
                }}
                onClick={() => {
                  if (dirty && role.roleCode !== selectedRoleCode) {
                    message.warning('请先保存或重置当前角色的修改');
                    return;
                  }
                  setSelectedRoleCode(role.roleCode);
                }}
              >
                <List.Item.Meta
                  title={role.roleName || getRoleLabel(role.roleCode)}
                  description={role.roleCode}
                />
              </List.Item>
            );
          }}
        />

        <Checkbox.Group
          style={{ width: '100%' }}
          value={checkedCodes}
          onChange={(values) => setCheckedCodes(values as string[])}
        >
          <List
            header={permissionHeader}
            bordered
            size="small"
            loading={permLoading}
            dataSource={selectedRoleCode ? permissionOptions : []}
            locale={{ emptyText: selectedRoleCode ? '暂无权限项' : '请选择左侧角色' }}
            rowKey="value"
            style={{ width: '100%' }}
            renderItem={(item) => (
              <List.Item>
                <Checkbox value={item.value}>
                  <Space wrap size={4}>
                    <Typography.Text strong>{item.label}</Typography.Text>
                    <Typography.Text type="secondary" code>
                      {item.value}
                    </Typography.Text>
                  </Space>
                  {item.description ? (
                    <div>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {item.description}
                      </Typography.Text>
                    </div>
                  ) : null}
                </Checkbox>
              </List.Item>
            )}
          />
        </Checkbox.Group>
    </div>
  );
}
