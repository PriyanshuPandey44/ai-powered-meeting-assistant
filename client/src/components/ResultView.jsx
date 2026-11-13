import { useState } from 'react';

const NS = 'Not specified';

function Cell({ value }) {
  return <span className={value === NS ? 'ns' : ''}>{value || NS}</span>;
}

export default function ResultView({ result }) {
  const [copied, setCopied] = useState(false);
  const { title, summary, keyPoints = [], actionItems = [], followUpEmail = {} } = result;

  async function copyEmail() {
    const text = `Subject: ${followUpEmail.subject}\n\n${followUpEmail.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy the email below:', text);
    }
  }

  return (
    <section className="results">
      <h2>{title}</h2>

      <div className="card">
        <h3>Summary</h3>
        <p>{summary}</p>
      </div>

      <div className="card">
        <h3>Key Points</h3>
        {keyPoints.length ? <ul>{keyPoints.map((p, i) => <li key={i}>{p}</li>)}</ul> : <p className="muted">No key points found.</p>}
      </div>

      <div className="card">
        <h3>Action Items</h3>
        {actionItems.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Task</th><th>Owner</th><th>Deadline</th></tr>
              </thead>
              <tbody>
                {actionItems.map((a, i) => (
                  <tr key={i}>
                    <td>{a.task}</td>
                    <td><Cell value={a.owner} /></td>
                    <td><Cell value={a.deadline} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">No action items found.</p>
        )}
      </div>

      <div className="card">
        <div className="row between">
          <h3>Follow-up Email</h3>
          <button type="button" className="btn secondary small-btn" onClick={copyEmail}>
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
        <p className="subject"><strong>Subject:</strong> {followUpEmail.subject}</p>
        <pre className="email">{followUpEmail.body}</pre>
      </div>
    </section>
  );
}
