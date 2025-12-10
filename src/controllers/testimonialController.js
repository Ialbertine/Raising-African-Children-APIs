const testimonialService = require('../services/testimonialService');

/**
 * Create a new testimonial
 */
const createTestimonial = async (req, res) => {
  try {
    const testimonial = await testimonialService.createTestimonial(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Thank you for your testimonial! It will be reviewed and published soon.',
      data: testimonial
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit testimonial'
    });
  }
};

/**
 * Get all testimonials (admin only - includes unapproved)
 */
const getAllTestimonials = async (req, res) => {
  try {
    const {
      page,
      limit,
      isApproved,
      featured,
      search
    } = req.query;

    const options = {
      page,
      limit,
      isApproved,
      featured,
      search
    };

    const result = await testimonialService.getAllTestimonials(options);
    
    res.status(200).json({
      success: true,
      data: result.testimonials,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch testimonials'
    });
  }
};

/**
 * Get approved testimonials (public endpoint)
 */
const getApprovedTestimonials = async (req, res) => {
  try {
    const {
      page,
      limit,
      featured
    } = req.query;

    const options = {
      page,
      limit,
      featured
    };

    const result = await testimonialService.getApprovedTestimonials(options);
    
    res.status(200).json({
      success: true,
      data: result.testimonials,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch testimonials'
    });
  }
};

/**
 * Get testimonial by ID
 */
const getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await testimonialService.getTestimonialById(id);
    
    res.status(200).json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    const statusCode = error.message === 'Testimonial not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch testimonial'
    });
  }
};

/**
 * Update testimonial (admin only)
 */
const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await testimonialService.updateTestimonial(id, req.body, req.adminId);
    
    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial
    });
  } catch (error) {
    const statusCode = error.message === 'Testimonial not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update testimonial'
    });
  }
};

/**
 * Approve testimonial (admin only)
 */
const approveTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await testimonialService.approveTestimonial(id, req.adminId);
    
    res.status(200).json({
      success: true,
      message: 'Testimonial approved successfully',
      data: testimonial
    });
  } catch (error) {
    const statusCode = error.message === 'Testimonial not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to approve testimonial'
    });
  }
};

/**
 * Reject testimonial (admin only)
 */
const rejectTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await testimonialService.rejectTestimonial(id);
    
    res.status(200).json({
      success: true,
      message: 'Testimonial rejected successfully',
      data: testimonial
    });
  } catch (error) {
    const statusCode = error.message === 'Testimonial not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to reject testimonial'
    });
  }
};

/**
 * Toggle featured status (admin only)
 */
const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await testimonialService.toggleFeatured(id);
    
    res.status(200).json({
      success: true,
      message: `Testimonial ${testimonial.featured ? 'featured' : 'unfeatured'} successfully`,
      data: testimonial
    });
  } catch (error) {
    const statusCode = error.message === 'Testimonial not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to toggle featured status'
    });
  }
};

/**
 * Delete testimonial (admin only)
 */
const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    await testimonialService.deleteTestimonial(id);
    
    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    const statusCode = error.message === 'Testimonial not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete testimonial'
    });
  }
};

/**
 * Get testimonial statistics (admin only)
 */
const getTestimonialStats = async (req, res) => {
  try {
    const stats = await testimonialService.getTestimonialStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch testimonial statistics'
    });
  }
};

module.exports = {
  createTestimonial,
  getAllTestimonials,
  getApprovedTestimonials,
  getTestimonialById,
  updateTestimonial,
  approveTestimonial,
  rejectTestimonial,
  toggleFeatured,
  deleteTestimonial,
  getTestimonialStats
};

