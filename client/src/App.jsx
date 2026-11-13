import { useCallback, useEffect, useState } from 'react';
import TranscriptForm from './components/TranscriptForm.jsx';
import ResultView from './components/ResultView.jsx';
import MeetingList from './components/MeetingList.jsx';
import { analyzeTranscript, deleteMeeting, getMeeting, listMeetings, saveMeeting } from './api.js';

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [listError, setListError] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  const refreshList = useCallback(async () => {
    try {
      setMeetings(await listMeetings());
      setListError('');
    } catch (e) {
      setListError(e.message);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { refreshList(); }, [refreshList]);

  async function handleGenerate(transcript) {
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const analysis = await analyzeTranscript(transcript);
      setResult(analysis);
      setActiveId(null);
      try {
        const saved = await saveMeeting(analysis);
        setActiveId(saved._id);
        refreshList();
      } catch (e) {
        setNotice(`Insights generated, but could not be saved: ${e.message}`);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(id) {
    setError('');
    setNotice('');
    try {
      setResult(await getMeeting(id));
      setActiveId(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this meeting record?')) return;
    try {
      await deleteMeeting(id);
      if (id === activeId) { setResult(null); setActiveId(null); }
      refreshList();
    } catch (e) {
      setListError(e.message);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📝 AI Meeting Assistant</h1>
        <p>Paste a transcript and get a summary, key points, action items and a follow-up email.</p>
      </header>

      <div className="layout">
        <main className="main">
          <TranscriptForm onSubmit={handleGenerate} loading={loading} />
          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert warn" role="status">{notice}</div>}
          {loading && <div className="card muted">Analyzing transcript with AI… this can take a few seconds.</div>}
          {result && !loading && <ResultView result={result} />}
        </main>

        <aside className="sidebar">
          <MeetingList
            meetings={meetings}
            loading={listLoading}
            error={listError}
            activeId={activeId}
            onSelect={handleSelect}
            onDelete={handleDelete}
          />
        </aside>
      </div>
    </div>
  );
}
