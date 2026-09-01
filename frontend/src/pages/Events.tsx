import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useApi, useNotification } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import type { Game } from '../types';
import { Clock, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';

function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { apiFetch, username } = useAuth();
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await apiFetch('/api/games', {
        method: 'POST',
        body: JSON.stringify({ location, time: date, username }),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Create New Event</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Location & Time</label>
            <input className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. The Barn - 11AM" required />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Event'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatTime(t: string | undefined): string {
  if (!t) return '';
  try {
    return new Date(t).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch { return t; }
}

function EventCard({ event }: { event: Game }) {
  const status = event.status ?? event.Status ?? 'scheduled';
  const isCompleted = status === 'completed';
  const statusColor = isCompleted ? 'var(--yellow-dark)' : 'var(--green)';
  return (
    <Link key={event.gid ?? event.GID} to={`/events/${event.gid ?? event.GID}`} style={{ textDecoration: 'none' }}>
      <div className="row-item fade-in" style={{ borderLeftColor: statusColor, cursor: 'pointer' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--charcoal)' }}>{event.location ?? event.Location ?? 'TBD'}</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} /> {formatTime(event.gametime ?? event.GameTime)}</div>
        </div>
        <div className="row-status" style={{ color: statusColor }}>{status}</div>
        <ChevronRight size={18} color="var(--gray-300)" />
      </div>
    </Link>
  );
}

export default function Events() {
  const { data: events, loading, error, refetch } = useApi<Game[]>('/api/games');
  const [showCreate, setShowCreate] = useState(false);
  const { show, Notification } = useNotification();

  const upcoming = (events ?? []).filter(e => (e.status ?? e.Status) !== 'completed');
  const completed = (events ?? []).filter(e => (e.status ?? e.Status) === 'completed');

  return (
    <div>
      {Notification}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div className="page-title">Events</div>
          <div className="page-subtitle">Join a session or create your own</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Event</button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>Loading events...</div>}

      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 14, display: 'flex', gap: 8 }}>
          <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Can't reach server — make sure your backend is running.
          <br /><span style={{ fontSize: 12, opacity: 0.8 }}>{error}</span></span>
        </div>
      )}

      {!loading && !error && upcoming.length === 0 && completed.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><Calendar size={40} color="var(--gray-300)" /></div>
          <div className="empty-title">No events yet</div>
          <div style={{ marginBottom: 20 }}>Create the first pickleball event!</div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Event</button>
        </div>
      )}

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Upcoming ({upcoming.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map(event => <EventCard key={event.gid ?? event.GID} event={event} />)}
          </div>
        </div>
      )}

      {/* Completed events */}
      {completed.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Completed ({completed.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {completed.map(event => <EventCard key={event.gid ?? event.GID} event={event} />)}
          </div>
        </div>
      )}

      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { show('Event created!', 'success'); refetch(); }}
        />
      )}
    </div>
  );
}