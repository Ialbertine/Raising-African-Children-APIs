const authService = require('../services/authService');

/**
 * Login admin
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginAdmin(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

/**
 * Get current admin profile
 */
const getProfile = async (req, res) => {
  try {
    const admin = await authService.getAdminProfile(req.adminId);

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Failed to fetch profile'
    });
  }
};

/**
 * Update admin profile
 */
const updateProfile = async (req, res) => {
  try {
    const admin = await authService.updateAdminProfile(req.adminId, req.body);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: admin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const result = await authService.changePassword(req.adminId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to change password'
    });
  }
};

/**
 * Request password reset
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await authService.generateResetToken(email);

    // Always return success message for security (don't reveal if email exists)
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    // Still return success for security
    res.status(200).json({
      success: true,
      message: 'If that email exists, a password reset link has been sent.'
    });
  }
};

/**
 * Reset password with token
 */
const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, token, and new password are required'
      });
    }

    const result = await authService.resetPassword(email, token, newPassword);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reset password'
    });
  }
};

/**
 * Verify reset token
 */
const verifyResetToken = async (req, res) => {
  try {
    const { email, token } = req.query;

    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: 'Email and token are required'
      });
    }

    const isValid = await authService.verifyResetToken(email, token);

    res.status(200).json({
      success: true,
      valid: isValid
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      valid: false
    });
  }
};

module.exports = {
  login,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyResetToken
};

