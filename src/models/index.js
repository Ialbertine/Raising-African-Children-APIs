const Admin = require("./Admin");
const Blog = require("./Blog");
const BlogTranslation = require("./BlogTranslation");
const Contact = require("./Contact");
const Testimonial = require("./Testimonial");

// Define associations
Blog.hasMany(BlogTranslation, {
  foreignKey: "blogId",
  as: "translations",
  onDelete: "CASCADE",
});

BlogTranslation.belongsTo(Blog, {
  foreignKey: "blogId",
  as: "blog",
});

Blog.belongsTo(Admin, {
  foreignKey: "authorId",
  as: "author",
});

Admin.hasMany(Blog, {
  foreignKey: "authorId",
  as: "blogs",
});

Testimonial.belongsTo(Admin, {
  foreignKey: "approvedBy",
  as: "approver",
});

Admin.hasMany(Testimonial, {
  foreignKey: "approvedBy",
  as: "approvedTestimonials",
});

module.exports = {
  Admin,
  Blog,
  BlogTranslation,
  Contact,
  Testimonial,
};
