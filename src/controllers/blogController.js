const blogService = require("../services/blogService");

/**
 * Create a new blog post
 */
const createBlog = async (req, res) => {
  try {
    const blog = await blogService.createBlog(req.body, req.adminId);

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create blog",
    });
  }
};

/**
 * Get all blogs
 */
const getAllBlogs = async (req, res) => {
  try {
    const {
      page,
      limit,
      status,
      languageCode,
      category,
      search,
      includeUnpublished,
    } = req.query;

    const options = {
      page,
      limit,
      status,
      languageCode,
      category,
      search,
      includeUnpublished:
        includeUnpublished === "true" && req.adminId ? true : false,
    };

    const result = await blogService.getAllBlogs(options);

    res.status(200).json({
      success: true,
      data: result.blogs,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
};

/**
 * Get blog by ID
 */
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const { languageCode } = req.query;

    const blog = await blogService.getBlogById(id, languageCode);

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    const statusCode = error.message === "Blog not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch blog",
    });
  }
};

/**
 * Get blog by slug
 */
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { languageCode } = req.query;

    const blog = await blogService.getBlogBySlug(slug, languageCode);

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    const statusCode = error.message === "Blog not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch blog",
    });
  }
};

/**
 * Update blog
 */
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await blogService.updateBlog(id, req.body, req.adminId);

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    const statusCode = error.message === "Blog not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update blog",
    });
  }
};

/**
 * Delete blog
 */
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    await blogService.deleteBlog(id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    const statusCode = error.message === "Blog not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete blog",
    });
  }
};

/**
 * Get blog categories
 */
const getCategories = async (req, res) => {
  try {
    const { languageCode } = req.query;
    const categories = await blogService.getCategories(languageCode);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
};

/**
 * Get blog tags
 */
const getTags = async (req, res) => {
  try {
    const { languageCode } = req.query;
    const tags = await blogService.getTags(languageCode);

    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tags",
    });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getCategories,
  getTags,
};
