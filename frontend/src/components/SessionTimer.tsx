import { useState, useEffect, CSSProperties } from 'react';

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

interface SessionTimerProps {
  startedAt?: string;
  style?: CSSProperties;
}

const defaultStyle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, fontVariantNumeric: 'tabular-nums',
};

export default function SessionTimer({ startedAt, style }: SessionTimerProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsedMs(Date.now() - start);
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  if (!startedAt) return null;

  return <div style={style ?? defaultStyle}>{formatElapsed(elapsedMs)}</div>;
}