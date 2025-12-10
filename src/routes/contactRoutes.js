const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate } = require('../middleware/auth');
const { validateContact } = require('../middleware/validation');

/**
 * @route   POST /api/contacts
 * @desc    Create a new contact inquiry (public)
 * @access  Public
 */
router.post(
  '/',
  validateContact.create,
  contactController.createContact
);

/**
 * @route   GET /api/contacts/stats
 * @desc    Get contact statistics
 * @access  Private (Admin only)
 */
router.get(
  '/stats',
  authenticate,
  contactController.getContactStats
);

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts
 * @access  Private (Admin only)
 */
router.get(
  '/',
  authenticate,
  validateContact.query,
  contactController.getAllContacts
);

/**
 * @route   GET /api/contacts/:id
 * @desc    Get contact by ID
 * @access  Private (Admin only)
 */
router.get(
  '/:id',
  authenticate,
  validateContact.getById,
  contactController.getContactById
);

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update a contact
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authenticate,
  validateContact.update,
  contactController.updateContact
);

/**
 * @route   PATCH /api/contacts/:id/read
 * @desc    Mark contact as read
 * @access  Private (Admin only)
 */
router.patch(
  '/:id/read',
  authenticate,
  validateContact.getById,
  contactController.markAsRead
);

/**
 * @route   PATCH /api/contacts/:id/unread
 * @desc    Mark contact as unread
 * @access  Private (Admin only)
 */
router.patch(
  '/:id/unread',
  authenticate,
  validateContact.getById,
  contactController.markAsUnread
);

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete a contact
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  validateContact.getById,
  contactController.deleteContact
);

module.exports = router;

