import { useCallback, useEffect, useRef, useState } from 'react';

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

export function useMessageReadAloud() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    utterRef.current = null;
    setActiveId(null);
  }, []);

  const toggle = useCallback(
    (messageId: string, rawText: string) => {
      if (activeId === messageId) {
        stop();
        return;
      }
      stop();
      const text = stripMarkdownLite(rawText);
      if (!text) return;

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-CN';
      utterRef.current = utter;
      utter.onend = () => setActiveId(null);
      utter.onerror = () => setActiveId(null);
      setActiveId(messageId);
      window.speechSynthesis.speak(utter);
    },
    [activeId, stop],
  );

  useEffect(() => () => stop(), [stop]);

  return { activeId, toggle, stop };
}
