import { useState, useEffect } from 'react';
import type { SubGame } from '../types';

const ALERT_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

interface LiveGameTimerProps {
  subGame: SubGame;
  onEndGame: () => void;
}

export default function LiveGameTimer({ subGame, onEndGame }: LiveGameTimerProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!subGame.startedat) return;
    const start = new Date(subGame.startedat).getTime();

    const tick = () => setElapsedMs(Date.now() - start);

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [subGame.startedat, subGame.sgid]);

  const overThreshold = elapsedMs >= ALERT_THRESHOLD_MS;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--charcoal)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32,
    }}>
      <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
        Game in progress
      </div>

      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 96, lineHeight: 1,
        color: overThreshold ? 'var(--danger)' : 'var(--white)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {formatElapsed(elapsedMs)}
      </div>

      <button onClick={onEndGame} className="btn btn-primary btn-lg">
        End Game
      </button>
    </div>
  );
}