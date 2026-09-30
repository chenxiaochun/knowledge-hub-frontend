import { PictureOutlined } from '@ant-design/icons';
import { Image } from 'antd';

import { parseToolPayload } from '../toolPayload';
import styles from './ChatMessageParts.module.scss';

type GenerateImageResult = {
  url: string;
  prompt?: string;
  mode?: string;
  size?: string;
  error?: string;
};

export default function GenerateImageCard({
  part,
}: {
  part: {
    state: string;
    input?: unknown;
    output?: unknown;
    errorText?: string;
  };
}) {
  const input = asRecord(part.input);
  const prompt = typeof input.prompt === 'string' ? input.prompt : '';
  const pending = part.state === 'input-streaming' || part.state === 'input-available';
  const output = asGenerateImageResult(part.output);
  const failed = part.state === 'output-error' || Boolean(output?.error);
  const label = pending ? '正在生成图片' : failed ? '生成失败' : '已生成图片';

  return (
    <div
      className={`${styles.genImage}${pending ? ` ${styles.pending}` : ''}${failed ? ` ${styles.failed}` : ''}`}
    >
      <div className={styles.genImageHead}>
        <PictureOutlined />
        <span className={styles.genImageLabel}>{label}</span>
        {prompt ? <span className={styles.webQ}>{prompt}</span> : null}
      </div>
      {failed ? (
        <div className={styles.webErr}>{output?.error || part.errorText}</div>
      ) : output?.url && !pending ? (
        <ChatImagePreview url={output.url} alt={prompt || output.prompt} />
      ) : null}
    </div>
  );
}

export function ChatImagePreview({ url, alt }: { url: string; alt?: string }) {
  const label = alt || '生成的图片';
  return (
    <Image
      classNames={{
        root: styles.genImageLink,
        image: styles.genImageImg,
      }}
      src={url}
      alt={label}
      preview={{
        src: url,
        cover: '点击放大',
        getContainer: () => document.body,
        zIndex: 1100,
      }}
    />
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

function asGenerateImageResult(value: unknown): GenerateImageResult | null {
  const rec = parseToolPayload(value);
  if (!rec) return null;
  if (typeof rec.error === 'string') {
    return { url: '', error: rec.error };
  }
  if (typeof rec.url !== 'string') return null;
  return {
    url: rec.url,
    prompt: typeof rec.prompt === 'string' ? rec.prompt : undefined,
    mode: typeof rec.mode === 'string' ? rec.mode : undefined,
    size: typeof rec.size === 'string' ? rec.size : undefined,
  };
}
