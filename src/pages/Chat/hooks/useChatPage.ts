import { App } from 'antd';
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  deleteApiAiAiSessionsId,
  getApiAiAiSessions,
  getApiAiAiSessionsIdMessages,
  postApiAiAiChat,
  postApiAiAiSessions,
  postApiAiRagSearch,
  type AiSessionEntity,
} from '@/service/api';

import type { LocalMessage, RagChunkHitDto } from '../types';
import { toLocalMessages } from '../utils';

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
  const { modal, message } = App.useApp();

  const [sessions, setSessions] = useState<AiSessionEntity[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [topK, setTopK] = useState(DEFAULT_TOP_K);
  const [searchOnlyMode, setSearchOnlyMode] = useState(false);
  const [sending, setSending] = useState(false);

  const loadedSessionRef = useRef<string | undefined>(undefined);
  const logPinBottomRef = useRef(true);

  const busy = sending;

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await getApiAiAiSessions({ query: { page: 1, pageSize: 50 } });
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
        const rows = await getApiAiAiSessionsIdMessages({ path: { id } });
        setMessages(toLocalMessages(rows));
      } catch {
        loadedSessionRef.current = undefined;
        message.error('加载会话失败');
        navigate('/chat', { replace: true });
      } finally {
        setMessagesLoading(false);
      }
    },
    [message, navigate],
  );

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (sending) return;
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
  }, [sessionId, sending, loadMessages]);

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
      const created = await postApiAiAiSessions({ body: {} });
      loadedSessionRef.current = created.id;
      setMessages([]);
      navigate(`/chat?session=${created.id}`);
      void loadSessions();
    } catch {
      message.error('创建会话失败');
    }
  }, [busy, loadSessions, message, navigate]);

  const onRemoveSession = useCallback(
    (id: string, e: MouseEvent) => {
      e.stopPropagation();
      if (busy) {
        message.warning('请等待当前回答结束再删除');
        return;
      }
      modal.confirm({
        title: '确定删除对话？',
        content: '删除后，聊天记录将不可恢复。',
        okText: '删除',
        cancelText: '取消',
        okType: 'danger',
        centered: true,
        onOk: async () => {
          await deleteApiAiAiSessionsId({ path: { id } });
          if (sessionId === id) {
            loadedSessionRef.current = undefined;
            setMessages([]);
            navigate('/chat');
          }
          void loadSessions();
        },
      });
    },
    [busy, loadSessions, message, modal, navigate, sessionId],
  );

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

    setInput('');
    logPinBottomRef.current = true;

    const userMsg: LocalMessage = {
      id: `local-user-${Date.now()}`,
      role: 'user',
      content: text,
    };
    const pendingId = `local-assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: pendingId, role: 'assistant', content: '', pending: true },
    ]);
    setSending(true);

    try {
      if (searchOnlyMode) {
        const hits = await postApiAiRagSearch({ body: { query: text, topK } });
        const assistant: LocalMessage = {
          id: pendingId,
          role: 'assistant',
          content: formatSearchOnlyAnswer(hits),
          ragHits: hits,
        };
        setMessages((prev) => prev.map((m) => (m.id === pendingId ? assistant : m)));
        return;
      }

      const res = await postApiAiAiChat({
        body: { content: text, topK, sessionId },
      });
      const nextSessionId = res.sessionId ?? sessionId;
      if (nextSessionId && nextSessionId !== sessionId) {
        loadedSessionRef.current = nextSessionId;
        navigate(`/chat?session=${nextSessionId}`, { replace: true });
      }
      if (nextSessionId) {
        const rows = await getApiAiAiSessionsIdMessages({
          path: { id: nextSessionId },
        });
        setMessages(toLocalMessages(rows));
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? {
                  id: pendingId,
                  role: 'assistant',
                  content: res.answer,
                  sources: res.sources ?? [],
                }
              : m,
          ),
        );
      }
      void loadSessions();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== pendingId));
    } finally {
      setSending(false);
    }
  }, [busy, input, loadSessions, navigate, searchOnlyMode, sessionId, topK]);

  return {
    sessionId,
    sessions,
    sessionsLoading,
    messages,
    messagesLoading,
    input,
    topK,
    searchOnlyMode,
    busy,
    logPinBottomRef,
    setInput,
    setTopK,
    setSearchOnlyMode,
    switchSession,
    onNewSession,
    onRemoveSession,
    send,
  };
}
