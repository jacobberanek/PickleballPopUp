import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Trophy } from 'lucide-react';

interface HistoryGame {
  sgid: number;
  gid: number;
  location: string;
  time: string;
  team1score: number;
  team2score: number;
  players: string[];
  winners: string[];
}

function formatTime(t: string | undefined): string {
  if (!t) return '';
  try {
    return new Date(t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch { return t; }
}

export default function GameHistory() {
  const { data: games, loading, error } = useApi<HistoryGame[]>('/api/games/history');
  const { username } = useAuth();
  const [filter, setFilter] = useState<'all' | 'mine'>('all');

  const filtered = (games ?? []).filter(g =>
    filter === 'mine' ? g.players?.filter(Boolean).includes(username ?? '') : true
  );

  const myRecord = (games ?? []).reduce(
    (acc, g) => {
      if (!g.players?.filter(Boolean).includes(username ?? '')) return acc;
      return g.winners?.includes(username ?? '')
        ? { ...acc, wins: acc.wins + 1 }
        : { ...acc, losses: acc.losses + 1 };
    },
    { wins: 0, losses: 0 }
  );

  const total = myRecord.wins + myRecord.losses;
  const winPct = total > 0 ? Math.round((myRecord.wins / total) * 100) : 0;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <div className="page-title">Game History</div>
        <div className="page-subtitle">All recorded match results</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">My Wins</div><div className="stat-value" style={{ color: 'var(--green)' }}>{myRecord.wins}</div></div>
        <div className="stat-card"><div className="stat-label">My Losses</div><div className="stat-value">{myRecord.losses}</div></div>
        <div className="stat-card">
          <div className="stat-label">My Win %</div>
          <div className="stat-value">{winPct}%</div>
          <div className="win-bar-wrap" style={{ marginTop: 8 }}><div className="win-bar" style={{ width: `${winPct}%` }} /></div>
        </div>
      </div>

      <div style={{
        position: 'relative', display: 'inline-flex', background: 'var(--gray-100)',
        borderRadius: 'var(--radius-sm)', padding: 3, marginBottom: 20,
      }}>
        <div style={{
          position: 'absolute', top: 3, bottom: 3, left: 3, width: 'calc(50% - 3px)',
          background: 'var(--charcoal)', borderRadius: 3,
          transform: filter === 'mine' ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 0.2s ease',
        }} />
        {([['all', 'All games'], ['mine', 'My games']] as const).map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            position: 'relative', zIndex: 1, padding: '7px 20px', fontSize: 13, fontWeight: 600,
            color: filter === v ? 'var(--white)' : 'var(--gray-700)',
            background: 'none', border: 'none', cursor: 'pointer', minWidth: 108,
            transition: 'color 0.2s ease',
          }}>{l}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>Loading...</div>}
      {error && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><ClipboardList size={40} color="var(--gray-300)" /></div>
          <div className="empty-title">No results recorded yet</div>
          <div>Complete an event with recorded games to see history here</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((game) => {
          const iPlayed = game.players?.filter(Boolean).includes(username ?? '');
          const iWon = game.winners?.includes(username ?? '');
          const t1wins = game.team1score > game.team2score;
          const barColor = iPlayed ? (iWon ? 'var(--green)' : 'var(--danger)') : 'var(--gray-300)';
          return (
            <div key={game.sgid} className="row-item fade-in" style={{ borderLeftColor: barColor }}>
              {iPlayed && (
                <div className="row-status" style={{ color: barColor, minWidth: 36 }}>{iWon ? 'win' : 'loss'}</div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{game.location}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                  {formatTime(game.time)} · {game.players?.filter(Boolean).join(', ')}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }}>
                  <span style={{ color: t1wins ? 'var(--green-dark)' : 'var(--gray-700)' }}>{game.team1score}</span>
                  <span style={{ color: 'var(--gray-300)', margin: '0 4px' }}>&ndash;</span>
                  <span style={{ color: !t1wins ? 'var(--green-dark)' : 'var(--gray-700)' }}>{game.team2score}</span>
                </div>
                {game.winners?.length > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--green-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    <Trophy size={12} /> {game.winners.join(' & ')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}