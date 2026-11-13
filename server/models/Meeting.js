const mongoose = require('mongoose');

const actionItemSchema = new mongoose.Schema(
  {
    task: { type: String, required: [true, 'Action item task is required'], trim: true },
    owner: { type: String, default: 'Not specified', trim: true },
    deadline: { type: String, default: 'Not specified', trim: true },
  },
  { _id: false }
);

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    transcript: { type: String, required: [true, 'Transcript is required'] },
    summary: { type: String, required: [true, 'Summary is required'] },
    keyPoints: { type: [String], default: [] },
    actionItems: { type: [actionItemSchema], default: [] },
    followUpEmail: {
      subject: { type: String, default: '' },
      body: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Meeting || mongoose.model('Meeting', meetingSchema);
