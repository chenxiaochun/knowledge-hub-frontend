/** LangChain tool 结果常为 JSON 字符串或带 content 的消息对象 */
export function parseToolPayload(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'string') {
    try {
      return parseToolPayload(JSON.parse(value));
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== 'object') return null;
  const rec = value as Record<string, unknown>;
  if (typeof rec.content === 'string') {
    const nested = parseToolPayload(rec.content);
    if (nested) return nested;
  }
  return rec;
}
