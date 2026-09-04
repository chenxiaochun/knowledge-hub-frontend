import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  deleteApiUserId,
  getApiUserPage,
  postApiUser,
  putApiUserId,
  type CreateUserDto,
  type UpdateUserDto,
  type UserVO,
} from '@/service/api';
import { getRoleLabel, ROLE_OPTIONS, RoleCode } from '@/constants/roles';

type UserPageResult = {
  list: UserVO[];
  total: number;
  page: number;
  pageSize: number;
};

type ListQuery = {
  page: number;
  pageSize: number;
  keyword: string;
};

type UserFormValues = {
  username: string;
  password?: string;
  realName?: string;
  email?: string;
  status: boolean;
  roleCodes?: string[];
};

export default function UsersPage() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<UserVO[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<ListQuery>({ page: 1, pageSize: 10, keyword: '' });
  const [keywordInput, setKeywordInput] = useState('');
  const requestSeq = useRef(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserVO | null>(null);
  const [form] = Form.useForm<UserFormValues>();

  const fetchList = useCallback(async (next: ListQuery) => {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const res = (await getApiUserPage({
        query: {
          page: next.page,
          pageSize: next.pageSize,
          keyword: next.keyword || undefined,
        },
      })) as UserPageResult;
      if (seq !== requestSeq.current) return;
      setData(res.list ?? []);
      setTotal(res.total ?? 0);
    } catch {
      // 错误已由拦截器提示
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
      }
    }
  }, []);

  // 列表查询：随 query 变化从后端同步
  useEffect(() => {
    void fetchList(query);
  }, [fetchList, query]);

  const updateQuery = (patch: Partial<ListQuery>) => {
    setQuery((prev) => ({ ...prev, ...patch }));
  };

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({
      username: '',
      password: '',
      realName: undefined,
      email: undefined,
      status: true,
      roleCodes: [RoleCode.USER],
    });
    setModalOpen(true);
  };

  const openEdit = (record: UserVO) => {
    setEditing(record);
    form.setFieldsValue({
      username: record.username,
      password: undefined,
      realName: record.realName ?? undefined,
      email: record.email ?? undefined,
      status: record.status === 1,
      roleCodes: (record.roleCodes ?? []).filter((code) => code && code !== '[]'),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editing) {
        const body: UpdateUserDto = {
          realName: values.realName,
          email: values.email,
          status: values.status ? 1 : 0,
          roleCodes: values.roleCodes,
        };
        if (values.password) {
          body.password = values.password;
        }
        await putApiUserId({ path: { id: editing.id }, body });
        message.success('用户已更新');
      } else {
        const body: CreateUserDto = {
          username: values.username,
          password: values.password!,
          realName: values.realName,
          email: values.email,
          status: values.status ? 1 : 0,
          roleCodes: values.roleCodes,
        };
        await postApiUser({ body });
        message.success('用户已创建');
      }
      setModalOpen(false);
      await fetchList(query);
    } catch {
      // 错误已由拦截器提示
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApiUserId({ path: { id } });
      message.success('用户已删除');
      if (data.length === 1 && query.page > 1) {
        updateQuery({ page: query.page - 1 });
      } else {
        await fetchList(query);
      }
    } catch {
      // 错误已由拦截器提示
    }
  };

  const columns: ColumnsType<UserVO> = [
    { title: '用户名', dataIndex: 'username', width: 140 },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      width: 120,
      render: (value: string | null | undefined) => value || '—',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      ellipsis: true,
      render: (value: string | null | undefined) => value || '—',
    },
    {
      title: '角色',
      dataIndex: 'roleCodes',
      width: 180,
      render: (codes: string[] = []) => {
        const cleaned = codes.filter((code) => code && code !== '[]');
        if (!cleaned.length) return '—';
        return (
          <Space size={[0, 4]} wrap>
            {cleaned.map((code) => (
              <Tag key={code}>{getRoleLabel(code)}</Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: number) =>
        status === 1 ? <Tag color="success">启用</Tag> : <Tag color="default">禁用</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (value: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—'),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该用户？"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => void handleDelete(record.id)}
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const pagination: TablePaginationConfig = {
    current: query.page,
    pageSize: query.pageSize,
    total,
    showSizeChanger: true,
    showTotal: (t) => `共 ${t} 条`,
    onChange: (nextPage, nextSize) => {
      updateQuery({ page: nextPage, pageSize: nextSize });
    },
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
        <Input.Search
          allowClear
          placeholder="搜索用户名 / 邮箱"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onSearch={(value) => {
            setKeywordInput(value);
            updateQuery({ page: 1, keyword: value.trim() });
          }}
          style={{ width: 260 }}
        />
        <Button type="primary" onClick={openCreate}>
          新建用户
        </Button>
      </Space>

      <Table<UserVO>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        scroll={{ x: 960 }}
      />

      <Modal
        title={editing ? '编辑用户' : '新建用户'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleSubmit()}
        confirmLoading={submitting}
        destroyOnHidden
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="username"
            label="用户名"
            rules={
              editing
                ? undefined
                : [
                    { required: true, message: '请输入用户名' },
                    { min: 2, message: '至少 2 个字符' },
                  ]
            }
          >
            <Input disabled={!!editing} placeholder="登录用户名" autoComplete="off" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={
              editing
                ? undefined
                : [
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '至少 6 位' },
                  ]
            }
            extra={editing ? '留空表示不修改密码' : undefined}
          >
            <Input.Password
              placeholder={editing ? '不修改请留空' : '登录密码'}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item name="realName" label="真实姓名">
            <Input placeholder="可选" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '邮箱格式不正确' }]}
          >
            <Input placeholder="可选" />
          </Form.Item>

          <Form.Item
            name="roleCodes"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="请选择角色"
              options={ROLE_OPTIONS}
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
