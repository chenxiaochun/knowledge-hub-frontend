import { App } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

import { buildSpeechTtsWsUrl } from '../utils/buildSpeechTtsWsUrl';

type TtsControlMessage = {
  type: string;
  sessionId?: string;
  message?: string;
};

export function useSpeechTts(sessionId: string | undefined) {
  const { message } = App.useApp();
  const [enabled, setEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const connectSessionRef = useRef<string | undefined>(sessionId);
  const audioQueueRef = useRef<Blob[]>([]);
  const playingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const enabledRef = useRef(false);

  enabledRef.current = enabled;
  connectSessionRef.current = sessionId;

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    audioQueueRef.current = [];
    playingRef.current = false;
    setSpeaking(false);
  }, []);

  const playNext = useCallback(() => {
    if (playingRef.current) return;
    const next = audioQueueRef.current.shift();
    if (!next) {
      setSpeaking(false);
      return;
    }

    playingRef.current = true;
    setSpeaking(true);
    const url = URL.createObjectURL(next);
    const audio = new Audio(url);
    audioRef.current = audio;

    const finish = () => {
      URL.revokeObjectURL(url);
      playingRef.current = false;
      audioRef.current = null;
      playNext();
    };

    audio.onended = finish;
    audio.onerror = finish;
    void audio.play().catch(finish);
  }, []);

  const enqueueAudio = useCallback(
    (data: ArrayBuffer) => {
      audioQueueRef.current.push(new Blob([data], { type: 'audio/mpeg' }));
      playNext();
    },
    [playNext],
  );

  const disconnect = useCallback(() => {
    const ws = wsRef.current;
    wsRef.current = null;
    if (ws && ws.readyState <= WebSocket.CLOSING) ws.close();
    stopPlayback();
  }, [stopPlayback]);

  const connect = useCallback(
    (targetSessionId?: string) => {
      disconnect();

      return new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(buildSpeechTtsWsUrl(targetSessionId));
        ws.binaryType = 'arraybuffer';
        wsRef.current = ws;

        ws.onopen = () => resolve();
        ws.onerror = () => reject(new Error('TTS WebSocket error'));

        ws.onmessage = (event) => {
          if (event.data instanceof ArrayBuffer) {
            enqueueAudio(event.data);
            return;
          }

          let payload: TtsControlMessage;
          try {
            payload = JSON.parse(String(event.data)) as TtsControlMessage;
          } catch {
            return;
          }

          switch (payload.type) {
            case 'tts_started':
              stopPlayback();
              break;
            case 'tts_error':
              message.warning(payload.message || '语音朗读失败');
              stopPlayback();
              break;
            case 'tts_closed':
              if (wsRef.current === ws) wsRef.current = null;
              stopPlayback();
              break;
            default:
              break;
          }
        };

        ws.onclose = () => {
          if (wsRef.current === ws) wsRef.current = null;
        };
      });
    },
    [disconnect, enqueueAudio, message, stopPlayback],
  );

  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }

    let cancelled = false;
    void connect(sessionId).catch(() => {
      if (cancelled) return;
      message.warning('语音朗读连接失败');
      setEnabled(false);
    });

    return () => {
      cancelled = true;
      disconnect();
    };
  }, [connect, disconnect, enabled, message, sessionId]);

  const ensureConnected = useCallback(
    async (targetSessionId: string) => {
      if (!enabledRef.current) return;
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN && connectSessionRef.current === targetSessionId) {
        return;
      }
      await connect(targetSessionId);
    },
    [connect],
  );

  return {
    enabled,
    setEnabled,
    speaking,
    ensureConnected,
    stopPlayback,
  };
}
