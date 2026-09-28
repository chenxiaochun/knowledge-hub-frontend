import { useCallback, useEffect, useRef, useState } from 'react';

import { App } from 'antd';

import { postApiSpeechAsr } from '@/service/api';

import { playSpeechTick } from '../utils/playSpeechTick';

const AUDIO_BAR_COUNT = 16;

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

function sampleAudioLevels(data: Uint8Array, barCount: number) {
  const usable = Math.max(1, Math.floor(data.length * 0.65));
  const segment = Math.max(1, Math.floor(usable / barCount));
  const levels = Array.from({ length: barCount }, (_, index) => {
    const start = index * segment;
    const end = Math.min(start + segment, usable);
    let sum = 0;
    for (let i = start; i < end; i += 1) {
      sum += data[i] ?? 0;
    }
    const avg = sum / Math.max(1, end - start);
    return Math.min(1, avg / 150);
  });
  return levels;
}

export function useBackendSpeechAsr(onRecognized: (text: string) => void, disabled = false) {
  const { message } = App.useApp();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(() =>
    Array.from({ length: AUDIO_BAR_COUNT }, () => 0.2),
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef('');

  const stopLevelMonitor = useCallback(() => {
    if (levelFrameRef.current !== null) {
      cancelAnimationFrame(levelFrameRef.current);
      levelFrameRef.current = null;
    }
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    void audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    setAudioLevels(Array.from({ length: AUDIO_BAR_COUNT }, () => 0.2));
  }, []);

  const startLevelMonitor = useCallback((stream: MediaStream) => {
    stopLevelMonitor();

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const buffer = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(buffer);
      setAudioLevels(sampleAudioLevels(buffer, AUDIO_BAR_COUNT));
      levelFrameRef.current = requestAnimationFrame(tick);
    };
    levelFrameRef.current = requestAnimationFrame(tick);
  }, [stopLevelMonitor]);

  const releaseStream = useCallback(() => {
    stopLevelMonitor();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, [stopLevelMonitor]);

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
      void playSpeechTick('end');
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
      startLevelMonitor(stream);
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
      void playSpeechTick('start');
    } catch {
      releaseStream();
      setRecording(false);
      message.error('无法访问麦克风，请检查权限');
    }
  }, [disabled, message, processing, recognizeAudio, releaseStream, startLevelMonitor, stopRecording]);

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
      stopLevelMonitor();
    };
  }, [releaseStream, stopLevelMonitor]);

  const allowSpeech: AllowSpeech = {
    recording,
    onRecordingChange,
  };

  return {
    allowSpeech,
    recording,
    processing,
    audioLevels,
    stopRecording,
  };
}
