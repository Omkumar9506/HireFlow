import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ['REGISTRATION', 'PASSWORD_RESET', 'EMAIL_VERIFICATION'],
      default: 'REGISTRATION',
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // MongoDB TTL index: automatically deletes document after 10 minutes (600s)
    },
  },
  {
    timestamps: true,
  }
);

export const Otp = mongoose.model('Otp', otpSchema);
