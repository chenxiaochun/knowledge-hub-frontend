import { useCallback, useEffect, useRef, useState } from 'react';

import { App } from 'antd';

import { postApiSpeechAsr } from '@/service/api';

type AllowSpeech = {
  recording?: boolean;
  onRecordingChange: (recording: boolean) => void;
};

function pickRecorderMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

function toAudioFile(blob: Blob, mimeType: string) {
  const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('ogg') ? 'ogg' : 'm4a';
  return new File([blob], `speech.${ext}`, { type: mimeType || blob.type || 'audio/webm' });
}

function extractAsrText(response: unknown) {
  if (!response || typeof response !== 'object') return '';
  const record = response as Record<string, unknown>;
  if (typeof record.text === 'string') return record.text.trim();
  const data = record.data;
  if (data && typeof data === 'object' && typeof (data as { text?: string }).text === 'string') {
    return (data as { text: string }).text.trim();
  }
  return '';
}

export function useBackendSpeechAsr(onRecognized: (text: string) => void, disabled = false) {
  const { message } = App.useApp();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef('');

  const releaseStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const recognizeAudio = useCallback(
    async (blob: Blob) => {
      setProcessing(true);
      try {
        const file = toAudioFile(blob, mimeTypeRef.current);
        const response = await postApiSpeechAsr({
          formData: { audio: file },
        } as Parameters<typeof postApiSpeechAsr>[0] & { formData: { audio: File } });
        const text = extractAsrText(response);
        if (text) {
          onRecognized(text);
        } else {
          message.warning('未识别到有效语音');
        }
      } catch {
        // 错误提示由 request 拦截器统一处理
      } finally {
        setProcessing(false);
      }
    },
    [message, onRecognized],
  );

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      releaseStream();
      setRecording(false);
    }
  }, [releaseStream]);

  const startRecording = useCallback(async () => {
    if (disabled || processing) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      message.error('当前浏览器不支持录音');
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickRecorderMimeType();
      mimeTypeRef.current = mimeType;
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        releaseStream();
        mediaRecorderRef.current = null;
        setRecording(false);

        const blob = new Blob(chunksRef.current, {
          type: mimeTypeRef.current || recorder.mimeType || 'audio/webm',
        });
        chunksRef.current = [];

        if (blob.size === 0) {
          message.warning('未录到有效音频');
          return;
        }

        void recognizeAudio(blob);
      };

      recorder.onerror = () => {
        message.error('录音失败，请重试');
        stopRecording();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      releaseStream();
      setRecording(false);
      message.error('无法访问麦克风，请检查权限');
    }
  }, [disabled, message, processing, recognizeAudio, releaseStream, stopRecording]);

  const onRecordingChange = useCallback(
    (nextRecording: boolean) => {
      if (disabled || processing) return;
      if (nextRecording) {
        void startRecording();
        return;
      }
      stopRecording();
    },
    [disabled, processing, startRecording, stopRecording],
  );

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null;
        recorder.stop();
      }
      releaseStream();
    };
  }, [releaseStream]);

  const allowSpeech: AllowSpeech = {
    recording,
    onRecordingChange,
  };

  return {
    allowSpeech,
    recording,
    processing,
  };
}
