import { useEffect, useRef, useState } from 'react';

import styles from './SpeechWaveOverlay.module.scss';

const WIDTH = 480;
const HEIGHT = 88;
const CENTER_Y = HEIGHT / 2;
const SEGMENTS = 56;
const WAVE_LENGTH = 168;

type Props = {
  mode: 'recording' | 'processing';
  levels?: number[];
  onStop?: () => void;
};

type WaveLineConfig = {
  offsetY: number;
  opacity: number;
  strokeWidth: number;
  speed: number;
  phase: number;
  swell: number;
};

type WaveLinePath = WaveLineConfig & {
  d: string;
};

const WAVE_LINES: WaveLineConfig[] = [
  { offsetY: -8, opacity: 0.45, strokeWidth: 0.85, speed: 1.04, phase: 0.8, swell: 0.32 },
  { offsetY: 0, opacity: 0.9, strokeWidth: 1, speed: 1, phase: 0, swell: 0.42 },
  { offsetY: 8, opacity: 0.45, strokeWidth: 0.85, speed: 0.96, phase: 2.1, swell: 0.32 },
];

function travelingWave(x: number, time: number, config: WaveLineConfig, amplitude: number) {
  const k = (Math.PI * 2) / WAVE_LENGTH;
  const motion = time * config.speed * 2.2 + config.phase;

  const crest = Math.sin(k * x - motion) * amplitude;
  const swell = Math.sin(k * x * 0.55 - motion * 0.65 + config.phase) * amplitude * config.swell;

  return crest + swell;
}

function buildSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length - 1; index += 1) {
    const xc = (points[index].x + points[index + 1].x) / 2;
    const yc = (points[index].y + points[index + 1].y) / 2;
    path += ` Q ${points[index].x} ${points[index].y} ${xc} ${yc}`;
  }

  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  path += ` Q ${prev.x} ${prev.y} ${last.x} ${last.y}`;

  return path;
}

function buildWaveLines(time: number, levels: number[] | undefined, boost: number) {
  const step = WIDTH / SEGMENTS;
  const globalLevel = averageLevel(levels) * boost;
  const amplitude = 9 + globalLevel * 20;

  return WAVE_LINES.map((config) => {
    const points = Array.from({ length: SEGMENTS + 1 }, (_, index) => {
      const x = index * step;
      const t = index / SEGMENTS;
      const envelope = 0.78 + 0.22 * Math.sin(t * Math.PI);
      const y =
        CENTER_Y + config.offsetY + travelingWave(x, time, config, amplitude * envelope);

      return { x, y };
    });

    return { ...config, d: buildSmoothPath(points) };
  });
}

export default function SpeechWaveOverlay({ mode, levels, onStop }: Props) {
  const isRecording = mode === 'recording';
  const [waveLines, setWaveLines] = useState<WaveLinePath[]>(() => buildWaveLines(0, levels, 1));
  const timeRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const levelsRef = useRef(levels);

  useEffect(() => {
    levelsRef.current = levels;
  }, [levels]);

  useEffect(() => {
    const tick = () => {
      timeRef.current += isRecording ? 0.04 : 0.028;
      const boost = isRecording ? 0.85 + averageLevel(levelsRef.current) * 0.9 : 1;
      setWaveLines(buildWaveLines(timeRef.current, levelsRef.current, boost));
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isRecording]);

  return (
    <div
      className={onStop ? `${styles.overlay} ${styles.overlayClickable}` : styles.overlay}
      aria-live="polite"
      role={onStop ? 'button' : undefined}
      tabIndex={onStop ? 0 : undefined}
      aria-label={onStop ? '点击结束录音' : undefined}
      onClick={onStop}
      onKeyDown={
        onStop
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onStop();
              }
            }
          : undefined
      }
    >
      <div className={styles.glow} />
      <div className={styles.content}>
        <div className={styles.waveStage}>
          <svg
            className={styles.waveSvg}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-label={isRecording ? '正在录音' : '语音识别中'}
          >
            <defs>
              <linearGradient
                id="speechWaveStroke"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1={CENTER_Y}
                x2={WIDTH}
                y2={CENTER_Y}
              >
                <stop offset="0%" stopColor="#1677ff" stopOpacity="0" />
                <stop offset="14%" stopColor="#69b1ff" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#1677ff" stopOpacity="1" />
                <stop offset="86%" stopColor="#69b1ff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#1677ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {waveLines.map((line) => (
              <path
                key={line.phase}
                className={styles.waveLine}
                d={line.d}
                fill="none"
                stroke="url(#speechWaveStroke)"
                strokeWidth={line.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={line.opacity}
              />
            ))}
          </svg>
          <span className={styles.waveFadeLeft} aria-hidden />
          <span className={styles.waveFadeRight} aria-hidden />
        </div>
        <p className={styles.label}>
          {isRecording ? '正在聆听，点击结束 · Esc 取消' : '语音识别中… · Esc 取消'}
        </p>
      </div>
    </div>
  );
}

function averageLevel(levels?: number[]) {
  if (!levels?.length) return 0.25;
  return levels.reduce((sum, level) => sum + level, 0) / levels.length;
}
