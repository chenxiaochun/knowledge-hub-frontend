import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { App, Button, Checkbox, Form, Input, Typography } from 'antd';

import AuthShell from '@/pages/Auth/AuthShell';
import styles from '@/pages/Auth/index.module.scss';
import { postApiAuthLogin } from '@/service/api';
import { isAuthenticated, setAuth, type LoginResult } from '@/utils/auth';

const REMEMBER_USERNAME_KEY = 'rememberUsername';

type LoginFormValues = {
  username: string;
  password: string;
  remember?: boolean;
};

type LocationState = {
  from?: { pathname?: string };
  username?: string;
};

export default function LoginPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();

  useEffect(() => {
    const stateUsername = (location.state as LocationState | null)?.username?.trim();
    if (stateUsername) {
      form.setFieldsValue({ username: stateUsername });
      return;
    }
    const remembered = localStorage.getItem(REMEMBER_USERNAME_KEY);
    if (remembered) {
      form.setFieldsValue({ username: remembered, remember: true });
    }
  }, [form, location.state]);

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const res = (await postApiAuthLogin({
        body: {
          username: values.username.trim(),
          password: values.password,
        },
      })) as LoginResult;

      if (!res?.accessToken) {
        message.error('登录响应异常，请稍后重试');
        return;
      }

      if (values.remember) {
        localStorage.setItem(REMEMBER_USERNAME_KEY, values.username.trim());
      } else {
        localStorage.removeItem(REMEMBER_USERNAME_KEY);
      }

      setAuth(res);
      message.success('登录成功');

      const from = (location.state as LocationState | null)?.from?.pathname;
      navigate(from && from !== '/login' && from !== '/register' ? from : '/', { replace: true });
    } catch {
      // 错误提示由 request 拦截器统一处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="登录系统" subtitle="欢迎登录企业智能知识库系统">
      <Form
        form={form}
        name="login"
        size="large"
        onFinish={onFinish}
        autoComplete="on"
        requiredMark={false}
        initialValues={{ remember: false }}
      >
        <Form.Item name="username" rules={[{ required: true, message: '请输入账号' }]}>
          <Input
            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="请输入账号"
            autoComplete="username"
            tabIndex={1}
          />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password
            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="请输入密码"
            autoComplete="current-password"
            tabIndex={2}
          />
        </Form.Item>

        <div className={styles.extraRow}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox tabIndex={3}>记住账号</Checkbox>
          </Form.Item>
          <Typography.Link tabIndex={4} onClick={() => message.info('请联系管理员重置密码')}>
            忘记密码?
          </Typography.Link>
        </div>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading} block tabIndex={5}>
            登录
          </Button>
        </Form.Item>
      </Form>

      <div className={styles.footer}>
        还没有账号？
        <Typography.Link tabIndex={6} onClick={() => navigate('/register')}>
          立即注册
        </Typography.Link>
      </div>
    </AuthShell>
  );
}
