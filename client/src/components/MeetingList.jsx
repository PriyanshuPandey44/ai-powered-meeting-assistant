const fmt = (d) =>
  new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function MeetingList({ meetings, loading, error, activeId, onSelect, onDelete }) {
  return (
    <div className="card">
      <h3>Previous meetings</h3>
      {loading && <p className="muted">Loading…</p>}
      {error && <div className="alert error">{error}</div>}
      {!loading && !error && meetings.length === 0 && <p className="muted">No meetings analyzed yet.</p>}
      <ul className="history">
        {meetings.map((m) => (
          <li key={m._id} className={m._id === activeId ? 'active' : ''}>
            <button type="button" className="history-item" onClick={() => onSelect(m._id)}>
              <strong>{m.title}</strong>
              <span className="muted small">{fmt(m.createdAt)} · {m.actionItems?.length || 0} action items</span>
            </button>
            <button type="button" className="icon-btn" aria-label={`Delete ${m.title}`} onClick={() => onDelete(m._id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
