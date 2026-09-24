import { authService } from './auth.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { auditService } from '../admin/audit.service.js';
import { ENV } from '../../config/env.js';

const cookieOptions = {
  httpOnly: true,
  secure: ENV.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const authController = {
  register: async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;
      const result = await authService.register({ name, email, password, role });

      res.cookie('refreshToken', result.refreshToken, cookieOptions);

      await auditService.logAction({
        userId: result.user.id,
        action: 'USER_REGISTERED',
        entity: 'USER',
        entityId: result.user.id,
        newValue: { name, email, role },
        req,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, result, 'Registration successful'));
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      res.cookie('refreshToken', result.refreshToken, cookieOptions);

      await auditService.logAction({
        userId: result.user.id,
        action: 'USER_LOGGED_IN',
        entity: 'USER',
        entityId: result.user.id,
        req,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const rawRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const result = await authService.refreshTokens(rawRefreshToken);

      res.cookie('refreshToken', result.refreshToken, cookieOptions);

      return res
        .status(200)
        .json(new ApiResponse(200, result, 'Token refreshed successfully'));
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      const rawRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
      await authService.logout(rawRefreshToken);

      res.clearCookie('refreshToken');

      return res
        .status(200)
        .json(new ApiResponse(200, null, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  },

  getMe: async (req, res, next) => {
    try {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            isEmailVerified: req.user.isEmailVerified,
            isActive: req.user.isActive,
            createdAt: req.user.createdAt,
          },
          'Current user profile retrieved'
        )
      );
    } catch (error) {
      next(error);
    }
  },

  verifyEmail: async (req, res, next) => {
    try {
      const { token } = req.body;
      await authService.verifyEmail(token);
      return res
        .status(200)
        .json(new ApiResponse(200, null, 'Email verified successfully'));
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      return res.status(200).json(
        new ApiResponse(
          200,
          null,
          'If an account exists with this email, a password reset link has been dispatched.'
        )
      );
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      return res
        .status(200)
        .json(new ApiResponse(200, null, 'Password reset successful. Please log in with your new password.'));
    } catch (error) {
      next(error);
    }
  },
};
