import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { App, Button, Result, Space } from 'antd';
import type { ResultProps } from 'antd';

import { getApiAuthVerifyEmail } from '@/service/api';

import styles from './index.module.scss';
import { resolveVerifyEmailError, type VerifyEmailStatus } from './verifyEmailStatus';

function getSuccessMessage(response: unknown) {
  if (response && typeof response === 'object' && 'message' in response) {
    const message = (response as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  return '账号激活成功，现在可以登录系统了';
}

type ResultConfig = Pick<ResultProps, 'status' | 'title' | 'subTitle'>;

function buildResultConfig(status: VerifyEmailStatus, detail: string): ResultConfig {
  switch (status) {
    case 'success':
      return {
        status: 'success',
        title: '账号已激活',
        subTitle: detail,
      };
    case 'already':
      return {
        status: '403',
        title: '账号已激活',
        subTitle: detail || '该账号此前已完成邮箱验证，您可以直接登录系统。',
      };
    case 'invalid':
      return {
        status: '403',
        title: '激活链接无效或已过期',
        subTitle: detail || '请重新注册，或联系管理员获取新的激活邮件。',
      };
    case 'error':
      return {
        status: 'error',
        title: '激活未完成',
        subTitle: detail,
      };
    default:
      return {
        status: 'info',
        title: '确认激活账号',
        subTitle:
          '您已从激活邮件进入本页面，点击下方按钮即可完成邮箱验证。激活成功后，请使用注册账号登录系统。',
      };
  }
}

export default function VerifyEmailPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [status, setStatus] = useState<VerifyEmailStatus>(() => (token ? 'ready' : 'invalid'));
  const [detail, setDetail] = useState(() =>
    token ? '' : '激活链接缺少必要参数，请检查邮件中的链接是否完整。',
  );

  const handleActivate = async () => {
    if (!token) {
      setStatus('invalid');
      setDetail('激活链接缺少必要参数，请检查邮件中的链接是否完整。');
      return;
    }

    setStatus('loading');
    setDetail('');

    try {
      const response = await getApiAuthVerifyEmail({
        query: { token },
        silentError: true,
      } as Parameters<typeof getApiAuthVerifyEmail>[0] & { silentError?: boolean });
      setStatus('success');
      setDetail(getSuccessMessage(response));
      message.success('激活成功');
    } catch (error) {
      const resolved = resolveVerifyEmailError(error);
      setStatus(resolved.status);
      setDetail(resolved.message);
    }
  };

  const resultConfig = buildResultConfig(status === 'loading' ? 'ready' : status, detail);

  const extra = (() => {
    switch (status) {
      case 'success':
      case 'already':
        return (
          <Button type="primary" onClick={() => navigate('/login', { replace: true })}>
            前往登录
          </Button>
        );
      case 'invalid':
        return (
          <Space size={12}>
            <Button onClick={() => navigate('/register', { replace: true })}>重新注册</Button>
            <Button type="primary" onClick={() => navigate('/login', { replace: true })}>
              返回登录
            </Button>
          </Space>
        );
      case 'error':
        return (
          <Space size={12}>
            <Button type="primary" onClick={() => void handleActivate()}>
              重试激活
            </Button>
            <Button onClick={() => navigate('/login', { replace: true })}>返回登录</Button>
          </Space>
        );
      default:
        return (
          <Space direction="vertical" size={12}>
            <Button type="primary" loading={status === 'loading'} onClick={() => void handleActivate()}>
              立即激活
            </Button>
            <Button type="link" onClick={() => navigate('/login', { replace: true })}>
              已完成激活？前往登录
            </Button>
          </Space>
        );
    }
  })();

  return (
    <div className={styles.page}>
      <Result className={styles.result} {...resultConfig} extra={extra} />
    </div>
  );
}
