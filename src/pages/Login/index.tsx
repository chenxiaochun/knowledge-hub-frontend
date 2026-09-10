import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { App, Button, Card, Checkbox, Form, Input, Typography } from 'antd';

import loginHero from '@/assets/login-hero.png';
import { postApiAuthLogin } from '@/service/api';
import { isAuthenticated, setAuth, type LoginResult } from '@/utils/auth';

import styles from './index.module.scss';

const REMEMBER_USERNAME_KEY = 'rememberUsername';

type LoginFormValues = {
  username: string;
  password: string;
  remember?: boolean;
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

  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBER_USERNAME_KEY);
    if (remembered) {
      form.setFieldsValue({ username: remembered, remember: true });
    }
  }, [form]);

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
      navigate(from && from !== '/login' ? from : '/', { replace: true });
    } catch {
      // 错误提示由 request 拦截器统一处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.brand}>
        <div className={styles.brandInner}>
          <h1 className={styles.brandTitle}>企业智能知识库系统</h1>
          <p className={styles.brandDesc}>
            构建企业知识中枢，赋能智能决策与高效协作
            <br />
            让知识管理更简单，知识价值最大化
          </p>
          <img className={styles.brandHero} src={loginHero} alt="" draggable={false} />
        </div>
      </section>

      <section className={styles.panel}>
        <Card className={styles.card} styles={{ body: { padding: '40px 36px' } }}>
          <h2 className={styles.cardTitle}>登录系统</h2>
          <Typography.Text className={styles.cardSubtitle}>
            欢迎登录企业智能知识库系统
          </Typography.Text>

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
              <Typography.Link
                tabIndex={4}
                onClick={() => message.info('请联系管理员重置密码')}
              >
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
            <Typography.Link
              tabIndex={6}
              onClick={() => message.info('注册功能即将开放，请联系管理员开通账号')}
            >
              立即注册
            </Typography.Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
