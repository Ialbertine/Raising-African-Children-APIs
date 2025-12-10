const { Contact } = require('../models');
const { Op } = require('sequelize');
const { sendContactNotification } = require('../utils/emailService');

/**
 * Create a new contact inquiry
 */
const createContact = async (contactData, req = null) => {
  try {
    // Extract IP address and user agent from request
    const ipAddress = req ? req.ip || req.connection.remoteAddress : null;
    const userAgent = req ? req.get('user-agent') : null;

    const contact = await Contact.create({
      ...contactData,
      ipAddress,
      userAgent
    });

    // Send notification email to admin
    try {
      await sendContactNotification({
        name: contact.name,
        email: contact.email,
        subject: contact.subject || 'No Subject',
        message: contact.message
      });
    } catch (emailError) {
      console.error('Failed to send contact notification email:', emailError);
      // Don't throw error - contact was created successfully
    }

    return contact;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all contacts with pagination and filters
 */
const getAllContacts = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      isRead,
      search
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Filter by read status
    if (isRead !== undefined) {
      where.isRead = isRead === 'true' || isRead === true;
    }

    // Search in name, email, subject, or message
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Contact.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return {
      contacts: rows,
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
 * Get contact by ID
 */
const getContactById = async (id) => {
  try {
    const contact = await Contact.findByPk(id);

    if (!contact) {
      throw new Error('Contact not found');
    }

    return contact;
  } catch (error) {
    throw error;
  }
};

/**
 * Update contact
 */
const updateContact = async (id, updateData) => {
  try {
    const contact = await Contact.findByPk(id);

    if (!contact) {
      throw new Error('Contact not found');
    }

    // If marking as read, set readAt timestamp
    if (updateData.isRead === true && !contact.isRead) {
      updateData.readAt = new Date();
    }

    // If marking as unread, clear readAt
    if (updateData.isRead === false) {
      updateData.readAt = null;
    }

    await contact.update(updateData);

    return contact;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark contact as read
 */
const markAsRead = async (id) => {
  try {
    const contact = await Contact.findByPk(id);

    if (!contact) {
      throw new Error('Contact not found');
    }

    await contact.update({
      isRead: true,
      readAt: new Date()
    });

    return contact;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark contact as unread
 */
const markAsUnread = async (id) => {
  try {
    const contact = await Contact.findByPk(id);

    if (!contact) {
      throw new Error('Contact not found');
    }

    await contact.update({
      isRead: false,
      readAt: null
    });

    return contact;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete contact
 */
const deleteContact = async (id) => {
  try {
    const contact = await Contact.findByPk(id);

    if (!contact) {
      throw new Error('Contact not found');
    }

    await contact.destroy();
    return { message: 'Contact deleted successfully' };
  } catch (error) {
    throw error;
  }
};

/**
 * Get contact statistics
 */
const getContactStats = async () => {
  try {
    const total = await Contact.count();
    const unread = await Contact.count({ where: { isRead: false } });
    const read = await Contact.count({ where: { isRead: true } });

    return {
      total,
      read,
      unread
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  markAsRead,
  markAsUnread,
  deleteContact,
  getContactStats
};

