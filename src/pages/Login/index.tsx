import { useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Input, Typography } from 'antd';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { postApiAuthLogin } from '@/service/api';
import { isAuthenticated, setAuth, type LoginResult } from '@/utils/auth';

type LoginFormValues = {
  username: string;
  password: string;
};

type LocationState = {
  from?: { pathname?: string };
};

export default function LoginPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();

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

      setAuth(res);
      message.success('登录成功');

      const from = (location.state as LocationState | null)?.from?.pathname;
      navigate(from && from !== '/login' ? from : '/', { replace: true });
    } catch {
      // 错误提示由 request 拦截器统一处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(160deg, #f0f5ff 0%, #f5f5f5 45%, #e6f4ff 100%)',
      }}
    >
      <Card style={{ width: 400, maxWidth: '100%' }} styles={{ body: { padding: '40px 32px' } }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Typography.Title level={3} style={{ marginBottom: 8 }}>
            Knowledge Hub
          </Typography.Title>
          <Typography.Text type="secondary">登录以继续使用管理后台</Typography.Text>
        </div>

        <Form
          form={form}
          name="login"
          size="large"
          onFinish={onFinish}
          autoComplete="on"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
