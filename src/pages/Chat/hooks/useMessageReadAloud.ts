import { App } from 'antd';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

import { postApiSpeechTts } from '@/service/api';

type TtsRequestOption = Parameters<typeof postApiSpeechTts>[0] & {
  responseType: 'blob';
  signal?: AbortSignal;
  silentError?: boolean;
  timeout?: number;
};

function stripMarkdownLite(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function toAudioBlob(data: unknown): Blob | null {
  if (data instanceof Blob) {
    return data.size > 0 ? data : null;
  }
  if (data instanceof ArrayBuffer && data.byteLength > 0) {
    return new Blob([data], { type: 'audio/mpeg' });
  }
  return null;
}

export function useMessageReadAloud() {
  const { message } = App.useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cleanupAudio = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    cleanupAudio();
    setActiveId(null);
    setLoadingId(null);
  }, [cleanupAudio]);

  const playBlob = useCallback(
    (blob: Blob, messageId: string) => {
      cleanupAudio();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      setActiveId(messageId);
      setLoadingId(null);

      const finish = () => {
        cleanupAudio();
        setActiveId((current) => (current === messageId ? null : current));
      };

      audio.onended = finish;
      audio.onerror = finish;
      void audio.play().catch(finish);
    },
    [cleanupAudio],
  );

  const toggle = useCallback(
    async (messageId: string, rawText: string) => {
      if (activeId === messageId || loadingId === messageId) {
        stop();
        return;
      }

      stop();
      const text = stripMarkdownLite(rawText);
      if (!text) return;

      const abortController = new AbortController();
      abortRef.current = abortController;
      setLoadingId(messageId);

      try {
        const data = await postApiSpeechTts({
          body: { text },
          signal: abortController.signal,
          silentError: true,
          timeout: 120_000,
          responseType: 'blob',
        } as TtsRequestOption);

        if (abortController.signal.aborted) return;

        const blob = toAudioBlob(data);
        if (!blob) {
          message.warning('语音朗读失败');
          setLoadingId(null);
          return;
        }

        playBlob(blob, messageId);
      } catch (error) {
        if (abortController.signal.aborted || axios.isCancel(error)) return;
        message.warning('语音朗读失败');
        setLoadingId(null);
      } finally {
        if (abortRef.current === abortController) {
          abortRef.current = null;
        }
      }
    },
    [activeId, loadingId, message, playBlob, stop],
  );

  useEffect(() => () => stop(), [stop]);

  return { activeId, loadingId, toggle, stop };
}
