const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateAuth } = require('../middleware/validation');

/**
 * @route   POST /api/auth/login
 * @desc    Login admin
 * @access  Public
 */
router.post(
  '/login',
  validateAuth.login,
  authController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current admin profile
 * @access  Private (Admin only)
 */
router.get(
  '/me',
  authenticate,
  authController.getProfile
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update admin profile
 * @access  Private (Admin only)
 */
router.put(
  '/profile',
  authenticate,
  validateAuth.updateProfile,
  authController.updateProfile
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password (requires current password)
 * @access  Private (Admin only)
 */
router.put(
  '/change-password',
  authenticate,
  validateAuth.changePassword,
  authController.changePassword
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset (sends email with reset link)
 * @access  Public
 */
router.post(
  '/forgot-password',
  validateAuth.requestPasswordReset,
  authController.requestPasswordReset
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  validateAuth.resetPassword,
  authController.resetPassword
);

/**
 * @route   GET /api/auth/verify-reset-token
 * @desc    Verify if reset token is valid
 * @access  Public
 */
router.get(
  '/verify-reset-token',
  authController.verifyResetToken
);

module.exports = router;

