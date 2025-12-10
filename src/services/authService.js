const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Admin } = require('../models');
const { sendEmail } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Generate JWT token
 */
const generateToken = (adminId) => {
  return jwt.sign({ id: adminId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

/**
 * Login admin
 */
const loginAdmin = async (email, password) => {
  try {
    // Find admin by email
    const admin = await Admin.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!admin) {
      throw new Error('Invalid email or password');
    }

    // Check if admin is active
    if (!admin.isActive) {
      throw new Error('Your account has been deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await admin.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken(admin.id);

    // Return admin data (password is automatically excluded by toJSON)
    return {
      admin: admin.toJSON(),
      token
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get current admin profile
 */
const getAdminProfile = async (adminId) => {
  try {
    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      throw new Error('Admin not found');
    }

    return admin.toJSON();
  } catch (error) {
    throw error;
  }
};

/**
 * Update admin profile
 */
const updateAdminProfile = async (adminId, updateData) => {
  try {
    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      throw new Error('Admin not found');
    }

    // Don't allow updating email, password, or reset tokens through this endpoint
    const { email, password, resetPasswordToken, resetPasswordExpires, ...allowedFields } = updateData;

    await admin.update(allowedFields);

    return admin.toJSON();
  } catch (error) {
    throw error;
  }
};

/**
 * Change password
 */
const changePassword = async (adminId, currentPassword, newPassword) => {
  try {
    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      throw new Error('Admin not found');
    }

    // Verify current password
    const isPasswordValid = await admin.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    // Update password (will be hashed by model hook)
    await admin.update({ password: newPassword });

    return { message: 'Password changed successfully' };
  } catch (error) {
    throw error;
  }
};

/**
 * Generate password reset token
 */
const generateResetToken = async (email) => {
  try {
    const admin = await Admin.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!admin) {
      // Don't reveal if email exists for security
      return { message: 'If that email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expiration (1 hour from now)
    const resetPasswordExpires = new Date();
    resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);

    // Save reset token and expiration
    await admin.update({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send reset email
    try {
      await sendEmail({
        to: admin.email,
        subject: 'Password Reset Request',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
              .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { margin-top: 20px; text-align: center; color: #777; font-size: 12px; }
              .warning { color: #ff9800; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Password Reset Request</h2>
              </div>
              <div class="content">
                <p>Hello ${admin.firstName},</p>
                <p>You requested to reset your password for the Raising African Children Admin Panel.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all;">${resetUrl}</p>
                <p class="warning">This link will expire in 1 hour.</p>
                <p>If you didn't request this password reset, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>This is an automated email from Raising African Children</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Password Reset Request

Hello ${admin.firstName},

You requested to reset your password for the Raising African Children Admin Panel.

Click this link to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.
        `
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Still return success message for security
    }

    return { message: 'If that email exists, a password reset link has been sent.' };
  } catch (error) {
    throw error;
  }
};

/**
 * Reset password with token
 */
const resetPassword = async (email, token, newPassword) => {
  try {
    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find admin with matching token and email
    const admin = await Admin.findOne({
      where: {
        email: email.toLowerCase().trim(),
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: {
          [Op.gt]: new Date() // Token not expired
        }
      }
    });

    if (!admin) {
      throw new Error('Invalid or expired reset token');
    }

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Update password and clear reset token
    await admin.update({
      password: newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    return { message: 'Password has been reset successfully' };
  } catch (error) {
    throw error;
  }
};

/**
 * Verify reset token
 */
const verifyResetToken = async (email, token) => {
  try {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const admin = await Admin.findOne({
      where: {
        email: email.toLowerCase().trim(),
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    return !!admin;
  } catch (error) {
    return false;
  }
};

module.exports = {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  generateResetToken,
  resetPassword,
  verifyResetToken,
  generateToken
};

