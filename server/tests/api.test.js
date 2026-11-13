// Run with: npm test  (no database or AI key needed for these cases)
const test = require('node:test');
const assert = require('node:assert');
const { normalizeAnalysis } = require('../services/ai');
const { validateTranscript } = require('../utils/validate');

test('rejects empty transcript', () => assert.throws(() => validateTranscript('   '), /empty/i));
test('rejects too short transcript', () => assert.throws(() => validateTranscript('hello'), /too short/i));
test('rejects binary content', () => assert.throws(() => validateTranscript('abc\u0000'.repeat(10)), /binary/i));

test('invented owners/deadlines become "Not specified"', () => {
  const transcript = 'Rahul will complete the homepage design by Friday. Priya will test the login flow.';
  const out = normalizeAnalysis(
    {
      summary: 'Launch prep.',
      actionItems: [
        { task: 'Homepage design', owner: 'Rahul', deadline: 'Friday' },
        { task: 'Test login flow', owner: 'Priya', deadline: 'Next Tuesday 5pm' },
        { task: 'Write content', owner: 'Amit', deadline: 'Not specified' },
      ],
    },
    transcript
  );
  assert.deepStrictEqual(out.actionItems.map((a) => [a.owner, a.deadline]), [
    ['Rahul', 'Friday'],
    ['Priya', 'Not specified'],
    ['Not specified', 'Not specified'],
  ]);
});

test('analyzeTranscript parses Gemini response (mocked fetch) and strips invented deadline', async () => {
  process.env.AI_PROVIDER = 'gemini';
  process.env.GEMINI_API_KEY = 'test';
  const { analyzeTranscript } = require('../services/ai');
  const aiJson = {
    title: 'Website launch sync',
    summary: 'Team reviewed launch prep.',
    keyPoints: ['Homepage design', 'Login testing'],
    actionItems: [
      { task: 'Complete homepage design', owner: 'Rahul', deadline: 'Friday' },
      { task: 'Test login and registration', owner: 'Priya', deadline: 'Wednesday' },
    ],
    followUpEmail: { subject: 'Recap', body: 'Hi team, ...' },
  };
  const realFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(aiJson) }] } }] }) });
  try {
    const out = await analyzeTranscript('Rahul will complete the homepage design by Friday. Priya will test the login and registration flow.');
    assert.strictEqual(out.actionItems[0].deadline, 'Friday');
    assert.strictEqual(out.actionItems[1].deadline, 'Not specified');
  } finally {
    global.fetch = realFetch;
  }
});

test('AI provider failure gives a clear error', async () => {
  const { analyzeTranscript } = require('../services/ai');
  const realFetch = global.fetch;
  global.fetch = async () => ({ ok: false, status: 429, json: async () => ({ error: { message: 'quota' } }) });
  try {
    await assert.rejects(() => analyzeTranscript('Some meeting text that is long enough.'), /rate limit/i);
  } finally {
    global.fetch = realFetch;
  }
});
