const express = require('express');
const Meeting = require('../models/Meeting');
const { dbMiddleware } = require('../config/db');
const { analyzeTranscript } = require('../services/ai');
const { validateTranscript } = require('../utils/validate');
const AppError = require('../utils/AppError');

const router = express.Router();

router.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

// 1) Receive transcript -> validate -> AI analysis (nothing is stored here)
router.post('/analyze', async (req, res, next) => {
  try {
    const transcript = validateTranscript(req.body?.transcript);
    const analysis = await analyzeTranscript(transcript);
    res.json({ success: true, data: { ...analysis, transcript } });
  } catch (err) {
    next(err);
  }
});

// 2) Save an analysed meeting to MongoDB
router.post('/meetings', dbMiddleware, async (req, res, next) => {
  try {
    const { title, summary, keyPoints, actionItems, followUpEmail } = req.body || {};
    const transcript = validateTranscript(req.body?.transcript);
    const meeting = await Meeting.create({ title, transcript, summary, keyPoints, actionItems, followUpEmail });
    res.status(201).json({ success: true, data: meeting });
  } catch (err) {
    next(err);
  }
});

// 3) List saved meetings (newest first, lightweight)
router.get('/meetings', dbMiddleware, async (req, res, next) => {
  try {
    const meetings = await Meeting.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select('title summary createdAt actionItems')
      .lean();
    res.json({ success: true, data: meetings });
  } catch (err) {
    next(err);
  }
});

// 4) Get one meeting with full details
router.get('/meetings/:id', dbMiddleware, async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id).lean();
    if (!meeting) throw new AppError(404, 'Meeting not found');
    res.json({ success: true, data: meeting });
  } catch (err) {
    next(err);
  }
});

// 5) Delete a meeting
router.delete('/meetings/:id', dbMiddleware, async (req, res, next) => {
  try {
    const meeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!meeting) throw new AppError(404, 'Meeting not found');
    res.json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
