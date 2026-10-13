import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Space, Typography } from 'antd';

import AuthShell from '@/pages/Auth/AuthShell';
import styles from '@/pages/Auth/index.module.scss';
import { postApiAuthPasswordReset, postApiAuthPasswordResetSendCode } from '@/service/api';
import { isAuthenticated } from '@/utils/auth';

const CODE_COUNTDOWN_SECONDS = 60;

type ForgotPasswordFormValues = {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ForgotPasswordPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [form] = Form.useForm<ForgotPasswordFormValues>();

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [countdown]);

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const onSendCode = async () => {
    try {
      const email = await form.validateFields(['email']);
      setSendingCode(true);
      await postApiAuthPasswordResetSendCode({
        body: { email: email.email.trim() },
      });
      message.success('验证码已发送，请查收邮箱');
      setCountdown(CODE_COUNTDOWN_SECONDS);
    } catch {
      // 表单校验失败或接口错误（接口错误由拦截器提示）
    } finally {
      setSendingCode(false);
    }
  };

  const onFinish = async (values: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      await postApiAuthPasswordReset({
        body: {
          email: values.email.trim(),
          code: values.code.trim(),
          newPassword: values.newPassword,
        },
      });
      message.success('密码重置成功，请使用新密码登录');
      navigate('/login', { replace: true });
    } catch {
      // 错误提示由 request 拦截器统一处理
    } finally {
      setLoading(false);
    }
  };

  const sendCodeDisabled = sendingCode || countdown > 0;
  const sendCodeLabel = countdown > 0 ? `${countdown}s 后重发` : '获取验证码';

  return (
    <AuthShell title="重置密码" subtitle="通过注册邮箱验证码设置新密码">
      <Form
        form={form}
        name="forgot-password"
        size="large"
        onFinish={onFinish}
        autoComplete="on"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="请输入注册邮箱"
            autoComplete="email"
            tabIndex={1}
          />
        </Form.Item>

        <Form.Item>
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item
              name="code"
              noStyle
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <Input
                prefix={<SafetyOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="请输入验证码"
                autoComplete="one-time-code"
                tabIndex={2}
              />
            </Form.Item>
            <Button
              type="default"
              loading={sendingCode}
              disabled={sendCodeDisabled}
              onClick={() => {
                void onSendCode();
              }}
              tabIndex={3}
              style={{ width: 120 }}
            >
              {sendCodeLabel}
            </Button>
          </Space.Compact>
        </Form.Item>

        <Form.Item
          name="newPassword"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '至少 6 位' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="请输入新密码"
            autoComplete="new-password"
            tabIndex={4}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请再次输入新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="请再次输入新密码"
            autoComplete="new-password"
            tabIndex={5}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading} block tabIndex={6}>
            重置密码
          </Button>
        </Form.Item>
      </Form>

      <div className={styles.footer}>
        想起密码了？
        <Typography.Link tabIndex={7} onClick={() => navigate('/login')}>
          返回登录
        </Typography.Link>
      </div>
    </AuthShell>
  );
}
