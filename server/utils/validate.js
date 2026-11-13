const AppError = require('./AppError');

const MIN_LENGTH = 20;
const MAX_LENGTH = 50000;

// Validates and normalises transcript text (pasted or read from a .txt file).
function validateTranscript(value) {
  if (typeof value !== 'string') throw new AppError(400, 'Transcript must be provided as text');
  const text = value.replace(/\r\n/g, '\n').trim();
  if (!text) throw new AppError(400, 'Transcript is empty. Paste meeting notes or upload a .txt file');
  if (text.includes('\u0000')) throw new AppError(400, 'File looks binary. Please upload a plain-text (.txt) transcript');
  if (text.length < MIN_LENGTH) throw new AppError(400, `Transcript is too short (minimum ${MIN_LENGTH} characters)`);
  if (text.length > MAX_LENGTH) throw new AppError(400, `Transcript is too long (maximum ${MAX_LENGTH} characters)`);
  return text;
}

module.exports = { validateTranscript };
