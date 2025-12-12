const { Blog, BlogTranslation, Admin } = require("../models");
const { Op } = require("sequelize");

/**
 * Generate slug from title
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Calculate reading time from content
 */
const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

/**
 * Create a new blog post
 */
const createBlog = async (blogData, authorId) => {
  try {
    const { translations, ...blogFields } = blogData;

    // Generate slug if not provided
    if (!blogFields.slug && translations && translations.length > 0) {
      blogFields.slug = generateSlug(translations[0].title);
    }

    // Check if slug already exists
    const existingBlog = await Blog.findOne({
      where: { slug: blogFields.slug },
    });
    if (existingBlog) {
      throw new Error("A blog with this slug already exists");
    }

    // Set author
    blogFields.authorId = authorId;

    // Set publishedAt if status is published
    if (blogFields.status === "published" && !blogFields.publishedAt) {
      blogFields.publishedAt = new Date();
    }

    // Create blog
    const blog = await Blog.create(blogFields);

    // Create translations
    const translationPromises = translations.map((translation) => {
      const readingTime = calculateReadingTime(translation.content);
      return BlogTranslation.create({
        ...translation,
        blogId: blog.id,
        readingTime,
      });
    });

    await Promise.all(translationPromises);

    // Fetch blog with translations and author
    const createdBlog = await Blog.findByPk(blog.id, {
      include: [
        {
          model: BlogTranslation,
          as: "translations",
        },
        {
          model: Admin,
          as: "author",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    return createdBlog;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all blogs with pagination and filters
 */
const getAllBlogs = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      languageCode,
      category,
      search,
      includeUnpublished = false,
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Filter by status
    if (status) {
      where.status = status;
    } else if (!includeUnpublished) {
      where.status = "published";
    }

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Search in translations
    const translationWhere = {};
    if (languageCode) {
      translationWhere.languageCode = languageCode;
    }

    if (search) {
      translationWhere[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Blog.findAndCountAll({
      where,
      include: [
        {
          model: BlogTranslation,
          as: "translations",
          where:
            Object.keys(translationWhere).length > 0
              ? translationWhere
              : undefined,
          required: languageCode ? true : false,
        },
        {
          model: Admin,
          as: "author",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    return {
      blogs: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get blog by ID
 */
const getBlogById = async (id, languageCode = null) => {
  try {
    const includeOptions = [
      {
        model: BlogTranslation,
        as: "translations",
        ...(languageCode && { where: { languageCode } }),
      },
      {
        model: Admin,
        as: "author",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ];

    const blog = await Blog.findByPk(id, {
      include: includeOptions,
    });

    if (!blog) {
      throw new Error("Blog not found");
    }

    return blog;
  } catch (error) {
    throw error;
  }
};

/**
 * Get blog by slug
 */
const getBlogBySlug = async (slug, languageCode = null) => {
  try {
    const includeOptions = [
      {
        model: BlogTranslation,
        as: "translations",
        ...(languageCode && { where: { languageCode } }),
      },
      {
        model: Admin,
        as: "author",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ];

    const blog = await Blog.findOne({
      where: { slug },
      include: includeOptions,
    });

    if (!blog) {
      throw new Error("Blog not found");
    }

    // Increment view count
    await blog.increment("viewCount");

    return blog;
  } catch (error) {
    throw error;
  }
};

/**
 * Update blog
 */
const updateBlog = async (id, blogData, authorId = null) => {
  try {
    const blog = await Blog.findByPk(id);
    if (!blog) {
      throw new Error("Blog not found");
    }

    const { translations, ...blogFields } = blogData;

    // Check slug uniqueness if changed
    if (blogFields.slug && blogFields.slug !== blog.slug) {
      const existingBlog = await Blog.findOne({
        where: { slug: blogFields.slug },
      });
      if (existingBlog) {
        throw new Error("A blog with this slug already exists");
      }
    }

    // Set publishedAt if status changed to published
    if (blogFields.status === "published" && blog.status !== "published") {
      blogFields.publishedAt = new Date();
    }

    // Update blog fields
    await blog.update(blogFields);

    // Update translations if provided
    if (translations && translations.length > 0) {
      // Delete existing translations
      await BlogTranslation.destroy({ where: { blogId: id } });

      // Create new translations
      const translationPromises = translations.map((translation) => {
        const readingTime = calculateReadingTime(translation.content);
        return BlogTranslation.create({
          ...translation,
          blogId: id,
          readingTime,
        });
      });

      await Promise.all(translationPromises);
    }

    // Fetch updated blog
    const updatedBlog = await Blog.findByPk(id, {
      include: [
        {
          model: BlogTranslation,
          as: "translations",
        },
        {
          model: Admin,
          as: "author",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    return updatedBlog;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete blog
 */
const deleteBlog = async (id) => {
  try {
    const blog = await Blog.findByPk(id);
    if (!blog) {
      throw new Error("Blog not found");
    }

    await blog.destroy();
    return { message: "Blog deleted successfully" };
  } catch (error) {
    throw error;
  }
};

/**
 * Get blog categories with translations
 */
const getCategories = async (languageCode = "en") => {
  try {
    // Get categories from both Blog and BlogTranslation tables
    const blogs = await Blog.findAll({
      where: { status: "published" },
      include: [
        {
          model: BlogTranslation,
          as: "translations",
          where: languageCode ? { languageCode } : undefined,
          required: false,
        },
      ],
    });

    const categories = new Set();

    blogs.forEach((blog) => {
      // Add category from translation if available
      if (blog.translations && blog.translations.length > 0) {
        blog.translations.forEach((translation) => {
          if (translation.category) {
            categories.add(translation.category);
          }
        });
      }
      // Fallback to default category
      if (blog.category) {
        categories.add(blog.category);
      }
    });

    return Array.from(categories).filter(Boolean);
  } catch (error) {
    throw error;
  }
};

/**
 * Get all tags with translations
 */
const getTags = async (languageCode = "en") => {
  try {
    // Get tags from both Blog and BlogTranslation tables
    const blogs = await Blog.findAll({
      where: { status: "published" },
      include: [
        {
          model: BlogTranslation,
          as: "translations",
          where: languageCode ? { languageCode } : undefined,
          required: false,
        },
      ],
    });

    const tags = new Set();

    blogs.forEach((blog) => {
      // Add tags from translation if available
      if (blog.translations && blog.translations.length > 0) {
        blog.translations.forEach((translation) => {
          if (translation.tags && Array.isArray(translation.tags)) {
            translation.tags.forEach((tag) => tags.add(tag));
          }
        });
      }
      // Fallback to default tags
      if (blog.tags && Array.isArray(blog.tags)) {
        blog.tags.forEach((tag) => tags.add(tag));
      }
    });

    return Array.from(tags).filter(Boolean);
  } catch (error) {
    throw error;
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
