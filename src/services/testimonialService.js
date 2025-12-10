const { Testimonial, Admin } = require('../models');
const { Op } = require('sequelize');
const { sendTestimonialNotification } = require('../utils/emailService');

/**
 * Create a new testimonial
 */
const createTestimonial = async (testimonialData) => {
  try {
    const testimonial = await Testimonial.create(testimonialData);

    // Send notification email to admin
    try {
      await sendTestimonialNotification({
        name: testimonial.name,
        email: testimonial.email,
        message: testimonial.message,
        rating: testimonial.rating || 5
      });
    } catch (emailError) {
      console.error('Failed to send testimonial notification email:', emailError);
      // Don't throw error - testimonial was created successfully
    }

    return testimonial;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all testimonials with pagination and filters
 */
const getAllTestimonials = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      isApproved,
      featured,
      search
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Filter by approval status
    if (isApproved !== undefined) {
      where.isApproved = isApproved === 'true' || isApproved === true;
    }

    // Filter by featured status
    if (featured !== undefined) {
      where.featured = featured === 'true' || featured === true;
    }

    // Search in name, email, company, or message
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Testimonial.findAndCountAll({
      where,
      include: [
        {
          model: Admin,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['featured', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    return {
      testimonials: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get approved testimonials (public endpoint)
 */
const getApprovedTestimonials = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      featured
    } = options;

    const offset = (page - 1) * limit;
    const where = {
      isApproved: true
    };

    if (featured !== undefined) {
      where.featured = featured === 'true' || featured === true;
    }

    const { count, rows } = await Testimonial.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['featured', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    return {
      testimonials: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get testimonial by ID
 */
const getTestimonialById = async (id) => {
  try {
    const testimonial = await Testimonial.findByPk(id, {
      include: [
        {
          model: Admin,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }

    return testimonial;
  } catch (error) {
    throw error;
  }
};

/**
 * Update testimonial
 */
const updateTestimonial = async (id, updateData, adminId = null) => {
  try {
    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }

    // If approving, set approvedAt and approvedBy
    if (updateData.isApproved === true && !testimonial.isApproved) {
      updateData.approvedAt = new Date();
      updateData.approvedBy = adminId;
    }

    // If unapproving, clear approval fields
    if (updateData.isApproved === false) {
      updateData.approvedAt = null;
      updateData.approvedBy = null;
    }

    await testimonial.update(updateData);

    // Fetch updated testimonial with approver info
    const updatedTestimonial = await Testimonial.findByPk(id, {
      include: [
        {
          model: Admin,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    return updatedTestimonial;
  } catch (error) {
    throw error;
  }
};

/**
 * Approve testimonial
 */
const approveTestimonial = async (id, adminId) => {
  try {
    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }

    await testimonial.update({
      isApproved: true,
      approvedAt: new Date(),
      approvedBy: adminId
    });

    const updatedTestimonial = await Testimonial.findByPk(id, {
      include: [
        {
          model: Admin,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    return updatedTestimonial;
  } catch (error) {
    throw error;
  }
};

/**
 * Reject testimonial (unapprove)
 */
const rejectTestimonial = async (id) => {
  try {
    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }

    await testimonial.update({
      isApproved: false,
      approvedAt: null,
      approvedBy: null
    });

    return testimonial;
  } catch (error) {
    throw error;
  }
};

/**
 * Toggle featured status
 */
const toggleFeatured = async (id) => {
  try {
    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }

    await testimonial.update({
      featured: !testimonial.featured
    });

    return testimonial;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete testimonial
 */
const deleteTestimonial = async (id) => {
  try {
    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }

    await testimonial.destroy();
    return { message: 'Testimonial deleted successfully' };
  } catch (error) {
    throw error;
  }
};

/**
 * Get testimonial statistics
 */
const getTestimonialStats = async () => {
  try {
    const total = await Testimonial.count();
    const approved = await Testimonial.count({ where: { isApproved: true } });
    const pending = await Testimonial.count({ where: { isApproved: false } });
    const featured = await Testimonial.count({ where: { featured: true, isApproved: true } });

    return {
      total,
      approved,
      pending,
      featured
    };
  } catch (error) {
    throw error;
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

