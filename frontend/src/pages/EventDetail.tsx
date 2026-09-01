import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useApi';
import type { Game, Player, ChatMessage } from '../types';
import { Clock, CheckCircle2, Trophy, Shuffle, Trash2, ArrowLeft, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import FloatingInput from '../components/FloatingInput';

interface SubGame {
  sgid: number;
  team1: string[];
  team2: string[];
  team1score: number;
  team2score: number;
  createdat: string;
}

interface NewGameModalProps {
  players: Player[];
  onClose: () => void;
  onRecorded: () => void;
  apiFetch: <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
  eventId: string;
}

function NewGameModal({ players, onClose, onRecorded, apiFetch, eventId }: NewGameModalProps) {
  const names = players.map(p => p.username ?? p.Username ?? '').filter(Boolean);
  const [team1, setTeam1] = useState<string[]>([]);
  const [team2, setTeam2] = useState<string[]>([]);
  const [team1score, setTeam1score] = useState('');
  const [team2score, setTeam2score] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'teams' | 'scores'>('teams');

  const togglePlayer = (name: string, team: 1 | 2) => {
    if (team === 1) {
      if (team1.includes(name)) setTeam1(team1.filter(p => p !== name));
      else if (!team2.includes(name)) setTeam1([...team1, name]);
    } else {
      if (team2.includes(name)) setTeam2(team2.filter(p => p !== name));
      else if (!team1.includes(name)) setTeam2([...team2, name]);
    }
  };

  const handleRandomize = () => {
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const mid = Math.ceil(shuffled.length / 2);
    setTeam1(shuffled.slice(0, mid));
    setTeam2(shuffled.slice(mid));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (team1.length === 0 || team2.length === 0) { setError('Both teams need players'); return; }
    if (!team1score || !team2score) { setError('Enter scores for both teams'); return; }
    setLoading(true);
    try {
      await apiFetch(`/api/games/${eventId}/subgame`, {
        method: 'POST',
        body: JSON.stringify({ team1, team2, team1score: parseInt(team1score), team2score: parseInt(team2score) }),
      });
      onRecorded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">Record New Game</div>

        {step === 'teams' ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>Assign players to teams</span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleRandomize}><Shuffle size={13} /> Random</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div style={{ background: 'var(--green-light)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 8 }}>TEAM A</div>
                  {team1.map(p => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{p}</span>
                      <button onClick={() => togglePlayer(p, 1)} style={{ fontSize: 14, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                    </div>
                  ))}
                  {team1.length === 0 && <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>No players yet</div>}
                </div>
                <div style={{ background: 'var(--yellow-light)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--yellow-dark)', marginBottom: 8 }}>TEAM B</div>
                  {team2.map(p => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{p}</span>
                      <button onClick={() => togglePlayer(p, 2)} style={{ fontSize: 14, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                    </div>
                  ))}
                  {team2.length === 0 && <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>No players yet</div>}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>Click a player to add to a team:</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {names.map(name => {
                  const inT1 = team1.includes(name);
                  const inT2 = team2.includes(name);
                  return (
                    <div key={name} style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => togglePlayer(name, 1)}
                        style={{
                          padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer',
                          background: inT1 ? 'var(--green)' : 'var(--gray-100)',
                          color: inT1 ? 'white' : 'var(--gray-700)',
                          border: '1px solid', borderColor: inT1 ? 'var(--green)' : 'var(--gray-300)',
                        }}
                      >A: {name}</button>
                      <button
                        onClick={() => togglePlayer(name, 2)}
                        style={{
                          padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer',
                          background: inT2 ? 'var(--yellow-dark)' : 'var(--gray-100)',
                          color: inT2 ? 'white' : 'var(--gray-700)',
                          border: '1px solid', borderColor: inT2 ? 'var(--yellow-dark)' : 'var(--gray-300)',
                        }}
                      >B: {name}</button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={team1.length === 0 || team2.length === 0}
                onClick={() => setStep('scores')}
              >Next: Enter Scores →</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ background: 'var(--green-light)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 4 }}>TEAM A</div>
                  <div style={{ fontSize: 13 }}>{team1.join(', ')}</div>
                </div>
                <FloatingInput label="Team A score" type="number" min={0} max={99} value={team1score} onChange={setTeam1score} required />
              </div>
              <div>
                <div style={{ background: 'var(--yellow-light)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--yellow-dark)', marginBottom: 4 }}>TEAM B</div>
                  <div style={{ fontSize: 13 }}>{team2.join(', ')}</div>
                </div>
                <FloatingInput label="Team B score" type="number" min={0} max={99} value={team2score} onChange={setTeam2score} required />
              </div>
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep('teams')}>← Back</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Record Game'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function formatTime(t: string | undefined): string {
  if (!t) return '';
  try {
    return new Date(t).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch { return t; }
}

function formatShortTime(t: string | undefined): string {
  if (!t) return '';
  try {
    return new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch { return t; }
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { username, apiFetch } = useAuth();
  const navigate = useNavigate();
  const { show, Notification } = useNotification();

  const [event, setEvent] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [subGames, setSubGames] = useState<SubGame[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewGame, setShowNewGame] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [eventsData, playersData, subGamesData, chatData] = await Promise.all([
        apiFetch<Game[]>('/api/games'),
        apiFetch<Player[]>(`/api/games/${id}/players`),
        apiFetch<SubGame[]>(`/api/games/${id}/subgames`),
        apiFetch<ChatMessage[]>(`/api/games/${id}/chat`),
      ]);
      setEvent(eventsData.find(g => String(g.gid ?? g.GID) === String(id)) ?? null);
      setPlayers(playersData);
      setSubGames(subGamesData);
      setChat(chatData);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Load failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleJoin = async () => {
    try { await apiFetch(`/api/games/${id}/join`, { method: 'POST', body: JSON.stringify({ username }) }); show('Joined!', 'success'); load(); }
    catch (err) { show(err instanceof Error ? err.message : 'Error', 'error'); }
  };

  const handleLeave = async () => {
    try { await apiFetch(`/api/games/${id}/leave`, { method: 'POST', body: JSON.stringify({ username }) }); show('Left event', 'default'); load(); }
    catch (err) { show(err instanceof Error ? err.message : 'Error', 'error'); }
  };

  const handleFinish = async () => {
    if (!window.confirm(`Finish this event? ${subGames.length} games will be recorded.`)) return;
    try { await apiFetch(`/api/games/${id}/finish`, { method: 'POST' }); show('Event completed!', 'success'); load(); }
    catch (err) { show(err instanceof Error ? err.message : 'Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event?')) return;
    try { await apiFetch(`/api/games/${id}/delete`, { method: 'POST', body: JSON.stringify({ username }) }); navigate('/events'); }
    catch (err) { show(err instanceof Error ? err.message : 'Error', 'error'); }
  };

  const handleSendChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    try {
      await apiFetch(`/api/games/${id}/chat`, { method: 'POST', body: JSON.stringify({ username, content: chatMsg }) });
      setChatMsg(''); load();
    } catch (err) { show(err instanceof Error ? err.message : 'Error', 'error'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>Loading...</div>;

  if (!event) return (
    <div>
      <button onClick={() => navigate('/events')} className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>← Back</button>
      <div className="empty-state"><div className="empty-title">Event not found</div></div>
    </div>
  );

  const isCompleted = (event.status ?? event.Status) === 'completed';
  const isCreator = (event.createdby ?? event.CreatedBy) === username;
  const isJoined = players.some(p => (p.username ?? p.Username) === username);
  const location = event.location ?? event.Location ?? '';
  const gameTime = event.gametime ?? event.GameTime ?? '';
  const hostName = event.createdby ?? event.CreatedBy;

  return (
    <div className="fade-in">
      {Notification}

      <button onClick={() => navigate('/events')} style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
        <ArrowLeft size={14} /> Back to Events
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div className="page-title">{location}</div>
          <div style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {formatTime(gameTime)}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className={`badge ${isCompleted ? 'badge-gray' : 'badge-green'}`}>
            {event.status ?? event.Status ?? 'scheduled'}
          </span>
          {!isCompleted && !isJoined && <button className="btn btn-primary btn-sm" onClick={handleJoin}>Join</button>}
          {!isCompleted && isJoined && !isCreator && <button className="btn btn-danger btn-sm" onClick={handleLeave}>Leave</button>}
          {!isCompleted && isCreator && (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => setShowNewGame(true)} disabled={players.length < 2}>+ Record Game</button>
              <button className="btn btn-secondary btn-sm" onClick={handleFinish} disabled={subGames.length === 0 || players.length < 2}><CheckCircle2 size={13} /> Finish Event</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}><Trash2 size={14} /></button>
            </>
          )}
        </div>
      </div>

      {/* Roster strip */}
      <div style={{ marginBottom: 20 }}>
        {players.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>No players yet</div>
        ) : (
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4 }}>
            {players.map((p, idx) => {
              const name = p.username ?? p.Username ?? '';
              const playerWins = subGames.filter(sg => sg.team1score > sg.team2score ? sg.team1.includes(name) : sg.team2.includes(name)).length;
              const playerGames = subGames.filter(sg => sg.team1.includes(name) || sg.team2.includes(name)).length;
              const isMe = name === username;
              const isHost = name === hostName;
              return (
                <div key={idx} style={{ textAlign: 'center', flexShrink: 0, width: 68 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', margin: '0 auto', position: 'relative',
                    background: 'var(--green-light)', color: 'var(--green-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14,
                    boxShadow: isMe ? '0 0 0 2px var(--green)' : 'none',
                  }}>
                    {name[0]?.toUpperCase()}
                    {isHost && <div style={{ position: 'absolute', top: -2, right: -2, width: 13, height: 13, borderRadius: '50%', background: 'var(--yellow)', border: '2px solid var(--gray-100)' }} />}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--charcoal)', marginTop: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>{name}</div>
                  {playerGames > 0 ? (
                    <div style={{ fontSize: 10, color: 'var(--gray-500)' }}>{playerWins}W {playerGames - playerWins}L</div>
                  ) : (
                    <div style={{ fontSize: 10, color: 'var(--gray-300)' }}>&mdash;</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats bar */}
      {subGames.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-label">Games Played</div>
            <div className="stat-value">{subGames.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Players</div>
            <div className="stat-value">{players.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Status</div>
            <div className="stat-value" style={{ fontSize: 18, marginTop: 6, display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              {isCompleted
                ? <><CheckCircle2 size={16} color="var(--green)" /> Done</>
                : <><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--yellow)', display: 'inline-block' }} /> Live</>}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Record game prompt */}
        {!isCompleted && isCreator && players.length >= 2 && subGames.length === 0 && (
          <div className="card" style={{ padding: '28px 24px', textAlign: 'center', borderStyle: 'dashed' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏓</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Ready to play!</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>{players.length} players have joined. Record your first game.</div>
            <button className="btn btn-primary" onClick={() => setShowNewGame(true)}>+ Record First Game</button>
          </div>
        )}

        {/* Games */}
        {subGames.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>
                Games ({subGames.length})
              </div>
              {!isCompleted && isCreator && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowNewGame(true)}>+ New Game</button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {subGames.map((sg, idx) => {
                const t1wins = sg.team1score > sg.team2score;
                return (
                  <div key={sg.sgid} className="score-panel">
                    <div className="score-panel-label">
                      GAME {idx + 1} · {formatShortTime(sg.createdat)}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
                      <div>
                        <div className="score-panel-name" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {t1wins && <Trophy size={12} color="var(--yellow)" />} {sg.team1?.join(', ') || '—'}
                        </div>
                      </div>
                      <div className="score-panel-value" style={{ fontSize: 44, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: t1wins ? 'var(--yellow)' : 'var(--white)' }}>{sg.team1score}</span>
                        <span style={{ fontSize: 24, color: 'rgba(255,255,255,0.3)' }}>&ndash;</span>
                        <span style={{ color: !t1wins ? 'var(--yellow)' : 'var(--white)' }}>{sg.team2score}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="score-panel-name" style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                          {sg.team2?.join(', ') || '—'} {!t1wins && <Trophy size={12} color="var(--yellow)" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat (collapsible) */}
        <div>
          <button onClick={() => setChatOpen(!chatOpen)} style={{
            width: '100%', background: 'var(--white)', border: '1.5px solid var(--line)', borderRadius: chatOpen ? '10px 10px 0 0' : 'var(--radius-lg)',
            padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--charcoal)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={16} /> Event chat {chat.length > 0 && <span style={{ color: 'var(--gray-500)', fontWeight: 400 }}>({chat.length})</span>}
            </span>
            {chatOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {chatOpen && (
            <div style={{ background: 'var(--white)', border: '1.5px solid var(--line)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '16px 18px' }}>
              <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {chat.length === 0 && <div style={{ color: 'var(--gray-500)', fontSize: 13 }}>No messages yet</div>}
                {chat.map((msg, i) => {
                  const msgName = msg.username ?? msg.Username ?? '';
                  const isMe = msgName === username;
                  return (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: 10, flexShrink: 0 }}>{msgName[0]?.toUpperCase()}</div>
                      <div style={{ background: isMe ? 'var(--green-light)' : 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '7px 11px', maxWidth: '70%' }}>
                        {!isMe && <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green-dark)', marginBottom: 2 }}>{msgName}</div>}
                        <div style={{ fontSize: 13 }}>{msg.content ?? msg.Content}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={handleSendChat} style={{ display: 'flex', gap: 8 }}>
                <input
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  placeholder="Say something..."
                  style={{
                    flex: 1, border: '1.5px solid var(--gray-300)', borderRadius: 99, padding: '9px 16px',
                    fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--charcoal)', outline: 'none',
                    background: 'var(--gray-100)', transition: 'border-color 0.15s ease',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--green)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--gray-300)'; }}
                />
                <button type="submit" className="btn btn-primary btn-sm btn-pill">Send</button>
              </form>
            </div>
          )}
        </div>
      </div>

      {showNewGame && (
        <NewGameModal
          players={players}
          onClose={() => setShowNewGame(false)}
          onRecorded={() => { show('Game recorded!', 'success'); load(); }}
          apiFetch={apiFetch}
          eventId={id!}
        />
      )}
    </div>
  );
}