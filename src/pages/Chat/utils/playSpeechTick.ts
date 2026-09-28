let tickContext: AudioContext | null = null;

async function getTickContext() {
  if (!tickContext || tickContext.state === 'closed') {
    tickContext = new AudioContext();
  }
  if (tickContext.state === 'suspended') {
    await tickContext.resume();
  }
  return tickContext;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  peak: number,
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peak, startTime + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

export async function playSpeechTick(type: 'start' | 'end') {
  try {
    const ctx = await getTickContext();
    const now = ctx.currentTime;
    const peak = 0.34;

    if (type === 'start') {
      playTone(ctx, 880, now, 0.07, peak);
      playTone(ctx, 1175, now + 0.09, 0.08, peak);
      return;
    }

    playTone(ctx, 660, now, 0.08, peak * 0.95);
    playTone(ctx, 494, now + 0.1, 0.09, peak * 0.95);
  } catch {
    // 浏览器不支持或用户未授权时静默跳过
  }
}
