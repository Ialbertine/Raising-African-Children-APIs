const contactService = require('../services/contactService');

/**
 * Create a new contact inquiry
 */
const createContact = async (req, res) => {
  try {
    const contact = await contactService.createContact(req.body, req);
    
    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon!',
      data: contact
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit contact form'
    });
  }
};

/**
 * Get all contacts (admin only)
 */
const getAllContacts = async (req, res) => {
  try {
    const {
      page,
      limit,
      isRead,
      search
    } = req.query;

    const options = {
      page,
      limit,
      isRead,
      search
    };

    const result = await contactService.getAllContacts(options);
    
    res.status(200).json({
      success: true,
      data: result.contacts,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch contacts'
    });
  }
};

/**
 * Get contact by ID (admin only)
 */
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await contactService.getContactById(id);
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    const statusCode = error.message === 'Contact not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch contact'
    });
  }
};

/**
 * Update contact (admin only)
 */
const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await contactService.updateContact(id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    const statusCode = error.message === 'Contact not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update contact'
    });
  }
};

/**
 * Mark contact as read (admin only)
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await contactService.markAsRead(id);
    
    res.status(200).json({
      success: true,
      message: 'Contact marked as read',
      data: contact
    });
  } catch (error) {
    const statusCode = error.message === 'Contact not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to mark contact as read'
    });
  }
};

/**
 * Mark contact as unread (admin only)
 */
const markAsUnread = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await contactService.markAsUnread(id);
    
    res.status(200).json({
      success: true,
      message: 'Contact marked as unread',
      data: contact
    });
  } catch (error) {
    const statusCode = error.message === 'Contact not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to mark contact as unread'
    });
  }
};

/**
 * Delete contact (admin only)
 */
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await contactService.deleteContact(id);
    
    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    const statusCode = error.message === 'Contact not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete contact'
    });
  }
};

/**
 * Get contact statistics (admin only)
 */
const getContactStats = async (req, res) => {
  try {
    const stats = await contactService.getContactStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch contact statistics'
    });
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

