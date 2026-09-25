import { useChat } from '@ai-sdk/react';
import { App } from 'antd';
import { DefaultChatTransport } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  deleteApiAiSessionsId,
  getApiAiSessions,
  getApiAiSessionsIdMessages,
  postApiAiRagSearch,
  postApiAiSessions,
  type AiSessionEntity,
} from '@/service/api';
import { getToken } from '@/utils/auth';

import type { KhUIMessage } from '../components/ChatMessageParts';
import type { LocalMessage, RagChunkHitDto } from '../types';
import { historyToUIMessages } from '../utils';

const CHAT_ID = 'kh-chat';
const DEFAULT_TOP_K = 5;

function formatSearchOnlyAnswer(hits: RagChunkHitDto[]) {
  if (!hits.length) return '未检索到相关资料。';
  const lines = hits.map((hit, i) => {
    const heading = hit.heading ? ` / ${hit.heading}` : '';
    const excerpt = hit.content.replace(/\s+/g, ' ').trim().slice(0, 160);
    return `${i + 1}. **${hit.documentTitle}**${heading}\n   ${excerpt}${excerpt.length >= 160 ? '…' : ''}`;
  });
  return `**检索结果**（共 ${hits.length} 条）\n\n${lines.join('\n\n')}`;
}

export function useChatPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get('session') || undefined;
  const { message } = App.useApp();

  const [sessions, setSessions] = useState<AiSessionEntity[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchOnlyMessages, setSearchOnlyMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [topK, setTopK] = useState(DEFAULT_TOP_K);
  const [searchOnlyMode, setSearchOnlyMode] = useState(false);
  const [searchOnlySending, setSearchOnlySending] = useState(false);

  const loadedSessionRef = useRef<string | undefined>(undefined);
  const sessionIdRef = useRef(sessionId);
  const topKRef = useRef(topK);
  const logPinBottomRef = useRef(false);

  sessionIdRef.current = sessionId;
  topKRef.current = topK;

  const transport = useMemo(
    () =>
      new DefaultChatTransport<KhUIMessage>({
        api: '/api/ai/chat/stream',
        headers: () => {
          const token = getToken();
          const headers: Record<string, string> = {};
          if (token) headers.Authorization = `Bearer ${token}`;
          return headers;
        },
      }),
    [],
  );

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    stop,
    error,
  } = useChat<KhUIMessage>({
    id: CHAT_ID,
    transport,
    onData: (part) => {
      if (part.type !== 'data-session') return;
      const nextId = (part.data as { sessionId?: string }).sessionId;
      if (!nextId || nextId === sessionIdRef.current) return;
      loadedSessionRef.current = nextId;
      navigate(`/chat?session=${nextId}`, { replace: true });
    },
    onFinish: () => {
      void loadSessions();
    },
    onError: (err) => {
      message.error(err.message || '请求失败');
    },
  });

  const streaming = status === 'submitted' || status === 'streaming';
  const busy = streaming || searchOnlySending;

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await getApiAiSessions({ query: { page: 1, pageSize: 50 } });
      setSessions(res.items ?? []);
    } catch {
      /* 列表失败不挡问答 */
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (id: string) => {
      setMessagesLoading(true);
      try {
        const rows = await getApiAiSessionsIdMessages({ path: { id } });
        setMessages(historyToUIMessages(rows));
      } catch {
        loadedSessionRef.current = undefined;
        message.error('加载会话失败');
        navigate('/chat', { replace: true });
      } finally {
        setMessagesLoading(false);
      }
    },
    [message, navigate, setMessages],
  );

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    setSearchOnlyMessages([]);
    logPinBottomRef.current = false;
  }, [sessionId]);

  useEffect(() => {
    if (streaming) return;
    if (!sessionId) {
      if (loadedSessionRef.current) {
        loadedSessionRef.current = undefined;
        setMessages([]);
      }
      return;
    }
    if (loadedSessionRef.current === sessionId) return;
    loadedSessionRef.current = sessionId;
    void loadMessages(sessionId);
  }, [sessionId, streaming, loadMessages, setMessages]);

  const switchSession = useCallback(
    (id?: string) => {
      if (busy) {
        message.warning('请等待当前回答结束再切换会话');
        return;
      }
      navigate(id ? `/chat?session=${id}` : '/chat');
    },
    [busy, message, navigate],
  );

  const onNewSession = useCallback(async () => {
    if (busy) {
      message.warning('请等待当前回答结束再开新对话');
      return;
    }
    try {
      const created = await postApiAiSessions({ body: {} });
      loadedSessionRef.current = created.id;
      setMessages([]);
      setSearchOnlyMessages([]);
      navigate(`/chat?session=${created.id}`);
      void loadSessions();
    } catch {
      message.error('创建会话失败');
    }
  }, [busy, loadSessions, message, navigate, setMessages]);

  const onRemoveSession = useCallback(
    async (id: string) => {
      if (busy) {
        message.warning('请等待当前回答结束再删除');
        return;
      }
      try {
        await deleteApiAiSessionsId({ path: { id } });
        if (sessionId === id) {
          loadedSessionRef.current = undefined;
          setMessages([]);
          setSearchOnlyMessages([]);
          navigate('/chat');
        }
        void loadSessions();
      } catch {
        message.error('删除失败');
      }
    },
    [busy, loadSessions, message, navigate, sessionId, setMessages],
  );

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

    setInput('');
    logPinBottomRef.current = true;

    if (searchOnlyMode) {
      const userMsg: LocalMessage = {
        id: `local-user-${Date.now()}`,
        role: 'user',
        content: text,
      };
      const pendingId = `local-assistant-${Date.now()}`;
      setSearchOnlyMessages((prev) => [
        ...prev,
        userMsg,
        { id: pendingId, role: 'assistant', content: '', pending: true },
      ]);
      setSearchOnlySending(true);
      try {
        const hits = await postApiAiRagSearch({ body: { query: text, topK } });
        const assistant: LocalMessage = {
          id: pendingId,
          role: 'assistant',
          content: formatSearchOnlyAnswer(hits),
          ragHits: hits,
        };
        setSearchOnlyMessages((prev) => prev.map((m) => (m.id === pendingId ? assistant : m)));
      } catch {
        setSearchOnlyMessages((prev) => prev.filter((m) => m.id !== pendingId));
      } finally {
        setSearchOnlySending(false);
      }
      return;
    }

    await sendMessage(
      { text },
      { body: { sessionId: sessionIdRef.current, topK: topKRef.current } },
    );
  }, [busy, input, searchOnlyMode, sendMessage, topK]);

  return {
    sessionId,
    sessions,
    sessionsLoading,
    messages,
    searchOnlyMessages,
    messagesLoading,
    input,
    topK,
    searchOnlyMode,
    busy,
    streaming,
    streamError: error,
    logPinBottomRef,
    setInput,
    setTopK,
    setSearchOnlyMode,
    switchSession,
    onNewSession,
    onRemoveSession,
    send,
    stop,
  };
}
