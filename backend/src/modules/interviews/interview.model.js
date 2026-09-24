import mongoose from 'mongoose';
import { INTERVIEW_TYPE, INTERVIEW_STATUS } from '../../utils/constants.js';

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(INTERVIEW_TYPE),
      default: INTERVIEW_TYPE.ONLINE,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Interview schedule date and time is required'],
      index: true,
    },
    duration: {
      type: Number, // in minutes
      default: 45,
      min: 15,
      max: 240,
    },
    meetingLink: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(INTERVIEW_STATUS),
      default: INTERVIEW_STATUS.SCHEDULED,
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      technicalSkillScore: { type: Number, min: 1, max: 5 },
      communicationScore: { type: Number, min: 1, max: 5 },
      cultureFitScore: { type: Number, min: 1, max: 5 },
      strengths: { type: String, default: '' },
      weaknesses: { type: String, default: '' },
      recommendation: {
        type: String,
        enum: ['STRONG_HIRE', 'HIRE', 'NEUTRAL', 'DO_NOT_HIRE', ''],
        default: '',
      },
      submittedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Interview = mongoose.model('Interview', interviewSchema);
