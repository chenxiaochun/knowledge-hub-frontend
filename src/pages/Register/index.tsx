import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { IdcardOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Typography } from 'antd';

import AuthShell from '@/pages/Auth/AuthShell';
import styles from '@/pages/Auth/index.module.scss';
import { postApiAuthRegister } from '@/service/api';
import { isAuthenticated } from '@/utils/auth';

type RegisterFormValues = {
  username: string;
  password: string;
  confirmPassword: string;
  realName?: string;
  email?: string;
};

function optionalText(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export default function RegisterPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<RegisterFormValues>();

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      await postApiAuthRegister({
        body: {
          username: values.username.trim(),
          password: values.password,
          realName: optionalText(values.realName),
          email: optionalText(values.email),
        },
      });
      message.success('注册成功，请登录');
      navigate('/login', {
        replace: true,
        state: { username: values.username.trim() },
      });
    } catch {
      // 错误提示由 request 拦截器统一处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="注册账号" subtitle="创建账号后即可登录企业智能知识库系统">
      <Form
        form={form}
        name="register"
        size="large"
        onFinish={onFinish}
        autoComplete="on"
        requiredMark={false}
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: '请输入账号' },
            { min: 2, message: '至少 2 个字符' },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="请输入账号"
            autoComplete="username"
            tabIndex={1}
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '至少 6 位' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="请输入密码"
            autoComplete="new-password"
            tabIndex={2}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: '请再次输入密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="请再次输入密码"
            autoComplete="new-password"
            tabIndex={3}
          />
        </Form.Item>

        <Form.Item name="realName">
          <Input
            prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="真实姓名（可选）"
            autoComplete="name"
            tabIndex={4}
          />
        </Form.Item>

        <Form.Item name="email" rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
          <Input
            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="邮箱（可选）"
            autoComplete="email"
            tabIndex={5}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading} block tabIndex={6}>
            注册
          </Button>
        </Form.Item>
      </Form>

      <div className={styles.footer}>
        已有账号？
        <Typography.Link tabIndex={7} onClick={() => navigate('/login')}>
          立即登录
        </Typography.Link>
      </div>
    </AuthShell>
  );
}
