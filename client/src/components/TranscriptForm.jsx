import { useRef, useState } from 'react';

const MAX_BYTES = 1024 * 1024;
const SAMPLE =
  'The team discussed the website launch. Rahul will complete the homepage design by Friday. Priya will test the login and registration flow. The next review meeting is scheduled for Monday. The marketing team will prepare the launch content.';

export default function TranscriptForm({ onSubmit, loading }) {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [localError, setLocalError] = useState('');
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalError('');
    if (!file.name.toLowerCase().endsWith('.txt')) return reject('Only .txt files are supported.');
    if (file.size === 0) return reject('The selected file is empty.');
    if (file.size > MAX_BYTES) return reject('File is too large (max 1 MB).');

    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      if (!content.trim()) return reject('The selected file has no text.');
      setLocalError('');
      setText(content);
      setFileName(file.name);
    };
    reader.onerror = () => reject('Could not read the file.');
    reader.readAsText(file);
  }

  function reject(msg) {
    setLocalError(msg);
    setFileName('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return setLocalError('Please paste a transcript or upload a .txt file first.');
    setLocalError('');
    onSubmit(text);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="row between">
        <label htmlFor="transcript" className="label">Meeting transcript</label>
        <button
          type="button"
          className="link"
          onClick={() => { setText(SAMPLE); setFileName(''); setLocalError(''); }}
        >
          Use sample
        </button>
      </div>
      <textarea
        id="transcript"
        rows={9}
        value={text}
        onChange={(e) => { setText(e.target.value); setFileName(''); setLocalError(''); }}
        placeholder="Paste your meeting notes or transcript here…"
        disabled={loading}
      />
      <div className="row between wrap">
        <div className="row">
          <label className="btn secondary">
            Upload .txt
            <input ref={fileRef} type="file" accept=".txt,text/plain" onChange={handleFile} hidden disabled={loading} />
          </label>
          {fileName && <span className="muted small">📄 {fileName}</span>}
        </div>
        <span className="muted small">{text.length.toLocaleString()} characters</span>
      </div>
      {localError && <div className="alert error" role="alert">{localError}</div>}
      <button type="submit" className="btn primary" disabled={loading}>
        {loading ? 'Generating…' : 'Generate Meeting Insights'}
      </button>
    </form>
  );
}