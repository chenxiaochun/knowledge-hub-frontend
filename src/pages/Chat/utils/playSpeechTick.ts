let tickContext: AudioContext | null = null;

/** iPhone「Tri-tone」短信提示音近似频率（D5 → E5 → G5） */
const TRI_TONE = [587.33, 659.25, 783.99] as const;

async function getTickContext() {
  if (!tickContext || tickContext.state === 'closed') {
    tickContext = new AudioContext();
  }
  if (tickContext.state === 'suspended') {
    await tickContext.resume();
  }
  return tickContext;
}

function playBellNote(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  peak: number,
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startTime);

  // 接近 iOS 提示音：极快起音 + 自然衰减
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.setValueAtTime(peak, startTime + 0.0008);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function playTriTone(
  ctx: AudioContext,
  notes: readonly number[],
  startTime: number,
  peak: number,
  noteDuration = 0.088,
  gap = 0.006,
) {
  notes.forEach((frequency, index) => {
    playBellNote(
      ctx,
      frequency,
      startTime + index * (noteDuration + gap),
      noteDuration,
      peak * (1 - index * 0.03),
    );
  });
}

export async function playSpeechTick(type: 'start' | 'end') {
  try {
    const ctx = await getTickContext();
    const now = ctx.currentTime;
    const peak = 0.58;

    if (type === 'start') {
      // 上行三连音，类似收到短信
      playTriTone(ctx, TRI_TONE, now, peak);
      return;
    }

    // 下行三连音，类似发送确认
    playTriTone(ctx, [...TRI_TONE].reverse(), now, peak);
  } catch {
    // 浏览器不支持或用户未授权时静默跳过
  }
}
