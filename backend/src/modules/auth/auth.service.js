import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from './user.model.js';
import { RefreshToken } from './refreshToken.model.js';
import { Otp } from './otp.model.js';
import { Candidate } from '../candidates/candidate.model.js';
import { Recruiter } from '../recruiters/recruiter.model.js';
import { ENV } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../utils/constants.js';
import { emailService } from '../../services/email.service.js';
import { logger } from '../../utils/logger.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    ENV.JWT_ACCESS_SECRET,
    { expiresIn: ENV.JWT_ACCESS_EXPIRY }
  );
};

const generateRefreshToken = async (user) => {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(rawToken);

  // 7 days expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,
  });

  return rawToken;
};

export const authService = {
  sendOtp: async ({ email, name, purpose = 'REGISTRATION' }) => {
    const cleanEmail = email.toLowerCase().trim();

    if (purpose === 'REGISTRATION') {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        throw new ApiError(409, 'An account with this email already exists.');
      }
    }

    // Rate limiting: check if OTP was created within the last 45 seconds
    const existingOtp = await Otp.findOne({ email: cleanEmail, purpose });
    if (existingOtp) {
      const diffSeconds = (Date.now() - new Date(existingOtp.createdAt).getTime()) / 1000;
      if (diffSeconds < 45) {
        throw new ApiError(429, `Please wait ${Math.ceil(45 - diffSeconds)} seconds before requesting a new code.`);
      }
      await Otp.deleteMany({ email: cleanEmail, purpose });
    }

    // Generate 6-digit numeric OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      email: cleanEmail,
      otp: rawOtp,
      purpose,
    });

    logger.info(`[AUTH OTP] 6-digit code for ${cleanEmail}: [ ${rawOtp} ]`);

    // Send email via configured SMTP asynchronously to avoid blocking the user with network latency
    emailService.sendOtpEmail(cleanEmail, name, rawOtp).catch((err) => {
      logger.error(`[AUTH OTP ERROR] Failed delivering verification email to ${cleanEmail}: ${err.message}`);
    });

    return {
      email: cleanEmail,
      expiresIn: 600,
    };
  },

  verifyOtp: async ({ email, otp, purpose = 'REGISTRATION' }) => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = (otp || '').toString().trim();

    const otpDoc = await Otp.findOne({ email: cleanEmail, purpose });
    if (!otpDoc) {
      throw new ApiError(400, 'Verification code has expired or was not requested. Please request a new code.');
    }

    if (otpDoc.attempts >= 5) {
      await Otp.deleteOne({ _id: otpDoc._id });
      throw new ApiError(400, 'Too many failed attempts. Please request a new verification code.');
    }

    if (otpDoc.otp !== cleanOtp) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      throw new ApiError(400, 'Invalid verification code. Please check your email and try again.');
    }

    return true;
  },

  register: async ({ name, email, password, role = ROLES.CANDIDATE, otp }) => {
    const cleanEmail = email.toLowerCase().trim();

    // If OTP is provided, verify it first and delete upon success
    if (otp) {
      const otpDoc = await Otp.findOne({ email: cleanEmail, purpose: 'REGISTRATION' });
      if (!otpDoc) {
        throw new ApiError(400, 'Verification code has expired or was not requested. Please request a new code.');
      }

      if (otpDoc.attempts >= 5) {
        await Otp.deleteOne({ _id: otpDoc._id });
        throw new ApiError(400, 'Too many failed attempts. Please request a new verification code.');
      }

      if (otpDoc.otp !== otp.toString().trim()) {
        otpDoc.attempts += 1;
        await otpDoc.save();
        throw new ApiError(400, 'Invalid verification code. Please check your email and try again.');
      }

      // Valid OTP! Delete it so it cannot be reused
      await Otp.deleteOne({ _id: otpDoc._id });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const passwordHash = await User.hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email: cleanEmail,
      passwordHash,
      role,
      verificationToken: hashToken(verificationToken),
      isEmailVerified: true,
    });

    // Create profile based on role
    if (role === ROLES.CANDIDATE) {
      await Candidate.create({ userId: user._id });
    } else if (role === ROLES.RECRUITER) {
      await Recruiter.create({ userId: user._id });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    // Send verification email in background
    emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  },

  refreshTokens: async (rawRefreshToken) => {
    if (!rawRefreshToken) {
      throw new ApiError(401, 'Refresh token required.');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const tokenDoc = await RefreshToken.findOne({ tokenHash });

    if (!tokenDoc || tokenDoc.revoked) {
      throw new ApiError(401, 'Invalid or expired refresh token. Please login again.');
    }

    if (new Date() > tokenDoc.expiresAt) {
      throw new ApiError(401, 'Refresh token expired. Please login again.');
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user || !user.isActive) {
      throw new ApiError(401, 'User account no longer active.');
    }

    // Token rotation: Revoke current and issue new pair
    tokenDoc.revoked = true;
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    tokenDoc.replacedByToken = hashToken(newRefreshToken);
    await tokenDoc.save();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt,
    });

    const accessToken = generateAccessToken(user);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  logout: async (rawRefreshToken) => {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await RefreshToken.updateOne({ tokenHash }, { revoked: true });
    }
    return true;
  },

  verifyEmail: async (token) => {
    const hashed = hashToken(token);
    const user = await User.findOne({ verificationToken: hashed });
    if (!user) {
      throw new ApiError(400, 'Invalid or expired verification link.');
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return true;
  },

  forgotPassword: async (email) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return true to avoid user enumeration
      return true;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
    return true;
  },

  resetPassword: async (token, newPassword) => {
    const hashed = hashToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired password reset link.');
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Revoke existing refresh tokens for security
    await RefreshToken.updateMany({ userId: user._id }, { revoked: true });

    return true;
  },
};
