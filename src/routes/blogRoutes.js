const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateBlog } = require('../middleware/validation');

/**
 * @route   GET /api/blogs
 * @desc    Get all blogs (public, but can include unpublished if admin)
 * @access  Public (with optional auth)
 */
router.get(
  '/',
  optionalAuth,
  validateBlog.query,
  blogController.getAllBlogs
);

/**
 * @route   GET /api/blogs/categories
 * @desc    Get all blog categories
 * @access  Public
 */
router.get(
  '/categories',
  blogController.getCategories
);

/**
 * @route   GET /api/blogs/:id
 * @desc    Get blog by ID
 * @access  Public
 */
router.get(
  '/:id',
  validateBlog.getById,
  blogController.getBlogById
);

/**
 * @route   GET /api/blogs/slug/:slug
 * @desc    Get blog by slug
 * @access  Public
 */
router.get(
  '/slug/:slug',
  validateBlog.getBySlug,
  blogController.getBlogBySlug
);

/**
 * @route   POST /api/blogs
 * @desc    Create a new blog post
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authenticate,
  validateBlog.create,
  blogController.createBlog
);

/**
 * @route   PUT /api/blogs/:id
 * @desc    Update a blog post
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authenticate,
  validateBlog.update,
  blogController.updateBlog
);

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Delete a blog post
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  validateBlog.getById,
  blogController.deleteBlog
);

module.exports = router;

