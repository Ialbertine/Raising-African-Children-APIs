const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  next();
};

/**
 * Blog validation rules
 */
const validateBlog = {
  create: [
    body('slug')
      .optional()
      .matches(/^[a-z0-9-]+$/i).withMessage('Slug can only contain letters, numbers, and hyphens'),
    // authorId is automatically set from authenticated admin, no need to validate
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived']).withMessage('Status must be draft, published, or archived'),
    body('category')
      .optional()
      .isString().withMessage('Category must be a string'),
    body('tags')
      .optional()
      .isArray().withMessage('Tags must be an array'),
    body('translations')
      .isArray({ min: 1 }).withMessage('At least one translation is required'),
    body('translations.*.languageCode')
      .isIn(['en', 'fr', 'es', 'de', 'rw', 'sw']).withMessage('Invalid language code'),
    body('translations.*.title')
      .notEmpty().withMessage('Title is required for each translation')
      .isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
    body('translations.*.content')
      .notEmpty().withMessage('Content is required for each translation'),
    handleValidationErrors
  ],

  update: [
    param('id')
      .isUUID().withMessage('Invalid blog ID'),
    body('slug')
      .optional()
      .matches(/^[a-z0-9-]+$/i).withMessage('Slug can only contain letters, numbers, and hyphens'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived']).withMessage('Status must be draft, published, or archived'),
    body('category')
      .optional()
      .isString().withMessage('Category must be a string'),
    body('tags')
      .optional()
      .isArray().withMessage('Tags must be an array'),
    handleValidationErrors
  ],

  getById: [
    param('id')
      .isUUID().withMessage('Invalid blog ID'),
    handleValidationErrors
  ],

  getBySlug: [
    param('slug')
      .notEmpty().withMessage('Slug is required'),
    handleValidationErrors
  ],

  query: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
    query('languageCode')
      .optional()
      .isIn(['en', 'fr', 'es', 'de', 'rw', 'sw']).withMessage('Invalid language code'),
    query('category')
      .optional()
      .isString().withMessage('Category must be a string'),
    handleValidationErrors
  ]
};

/**
 * Contact validation rules
 */
const validateContact = {
  create: [
    body('name')
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    body('phone')
      .optional()
      .isString().withMessage('Phone must be a string'),
    body('subject')
      .optional()
      .isLength({ max: 200 }).withMessage('Subject must be less than 200 characters'),
    body('message')
      .notEmpty().withMessage('Message is required')
      .isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
    handleValidationErrors
  ],

  update: [
    param('id')
      .isUUID().withMessage('Invalid contact ID'),
    body('isRead')
      .optional()
      .isBoolean().withMessage('isRead must be a boolean'),
    handleValidationErrors
  ],

  getById: [
    param('id')
      .isUUID().withMessage('Invalid contact ID'),
    handleValidationErrors
  ],

  query: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('isRead')
      .optional()
      .isBoolean().withMessage('isRead must be a boolean'),
    handleValidationErrors
  ]
};

/**
 * Testimonial validation rules
 */
const validateTestimonial = {
  create: [
    body('name')
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    body('message')
      .notEmpty().withMessage('Message is required')
      .isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('company')
      .optional()
      .isString().withMessage('Company must be a string'),
    body('position')
      .optional()
      .isString().withMessage('Position must be a string'),
    handleValidationErrors
  ],

  update: [
    param('id')
      .isUUID().withMessage('Invalid testimonial ID'),
    body('isApproved')
      .optional()
      .isBoolean().withMessage('isApproved must be a boolean'),
    body('featured')
      .optional()
      .isBoolean().withMessage('featured must be a boolean'),
    handleValidationErrors
  ],

  getById: [
    param('id')
      .isUUID().withMessage('Invalid testimonial ID'),
    handleValidationErrors
  ],

  query: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('isApproved')
      .optional()
      .isBoolean().withMessage('isApproved must be a boolean'),
    query('featured')
      .optional()
      .isBoolean().withMessage('featured must be a boolean'),
    handleValidationErrors
  ]
};

/**
 * Auth validation rules
 */
const validateAuth = {
  login: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 1 }).withMessage('Password is required'),
    handleValidationErrors
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
    handleValidationErrors
  ],

  requestPasswordReset: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    handleValidationErrors
  ],

  resetPassword: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    body('token')
      .notEmpty().withMessage('Reset token is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    handleValidationErrors
  ],

  updateProfile: [
    body('firstName')
      .optional()
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .optional()
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    handleValidationErrors
  ]
};

module.exports = {
  validateBlog,
  validateContact,
  validateTestimonial,
  validateAuth,
  handleValidationErrors
};

