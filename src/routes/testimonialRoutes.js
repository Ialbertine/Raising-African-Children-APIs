const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const { authenticate } = require('../middleware/auth');
const { validateTestimonial } = require('../middleware/validation');

/**
 * @route   POST /api/testimonials
 * @desc    Create a new testimonial (public)
 * @access  Public
 */
router.post(
  '/',
  validateTestimonial.create,
  testimonialController.createTestimonial
);

/**
 * @route   GET /api/testimonials/approved
 * @desc    Get approved testimonials (public)
 * @access  Public
 */
router.get(
  '/approved',
  validateTestimonial.query,
  testimonialController.getApprovedTestimonials
);

/**
 * @route   GET /api/testimonials/stats
 * @desc    Get testimonial statistics
 * @access  Private (Admin only)
 */
router.get(
  '/stats',
  authenticate,
  testimonialController.getTestimonialStats
);

/**
 * @route   GET /api/testimonials
 * @desc    Get all testimonials (includes unapproved - admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/',
  authenticate,
  validateTestimonial.query,
  testimonialController.getAllTestimonials
);

/**
 * @route   GET /api/testimonials/:id
 * @desc    Get testimonial by ID
 * @access  Public (but unapproved only visible to admin)
 */
router.get(
  '/:id',
  validateTestimonial.getById,
  testimonialController.getTestimonialById
);

/**
 * @route   PUT /api/testimonials/:id
 * @desc    Update a testimonial
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authenticate,
  validateTestimonial.update,
  testimonialController.updateTestimonial
);

/**
 * @route   PATCH /api/testimonials/:id/approve
 * @desc    Approve a testimonial
 * @access  Private (Admin only)
 */
router.patch(
  '/:id/approve',
  authenticate,
  validateTestimonial.getById,
  testimonialController.approveTestimonial
);

/**
 * @route   PATCH /api/testimonials/:id/reject
 * @desc    Reject a testimonial
 * @access  Private (Admin only)
 */
router.patch(
  '/:id/reject',
  authenticate,
  validateTestimonial.getById,
  testimonialController.rejectTestimonial
);

/**
 * @route   PATCH /api/testimonials/:id/featured
 * @desc    Toggle featured status
 * @access  Private (Admin only)
 */
router.patch(
  '/:id/featured',
  authenticate,
  validateTestimonial.getById,
  testimonialController.toggleFeatured
);

/**
 * @route   DELETE /api/testimonials/:id
 * @desc    Delete a testimonial
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  validateTestimonial.getById,
  testimonialController.deleteTestimonial
);

module.exports = router;

