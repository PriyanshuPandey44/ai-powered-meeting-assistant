const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) throw new Error(body?.error || `Request failed (${res.status})`);
  return body.data;
}

export const analyzeTranscript = (transcript) =>
  request('/analyze', { method: 'POST', body: JSON.stringify({ transcript }) });
export const saveMeeting = (meeting) => request('/meetings', { method: 'POST', body: JSON.stringify(meeting) });
export const listMeetings = () => request('/meetings');
export const getMeeting = (id) => request(`/meetings/${id}`);
export const deleteMeeting = (id) => request(`/meetings/${id}`, { method: 'DELETE' });
