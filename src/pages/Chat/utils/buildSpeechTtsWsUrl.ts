/** 开发环境走 Vite 代理；生产环境使用当前页面 host */
export function buildSpeechTtsWsUrl(sessionId?: string): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const url = new URL(`${protocol}//${window.location.host}/api/speech/tts/ws`);
  if (sessionId) url.searchParams.set('sessionId', sessionId);
  return url.toString();
}
