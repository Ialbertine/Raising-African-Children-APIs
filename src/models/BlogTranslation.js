const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const BlogTranslation = sequelize.define(
  "BlogTranslation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    blogId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "blog_id",
    },
    languageCode: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "language_code",
      validate: {
        isIn: [["en", "fr", "es", "de", "rw", "sw"]], // English, French, Spanish, German, Kinyarwanda, Swahili
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metaDescription: {
      type: DataTypes.STRING(160),
      allowNull: true,
      field: "meta_description",
    },
    metaKeywords: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "meta_keywords",
    },
    readingTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "reading_time",
      comment: "Estimated reading time in minutes",
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Translated category for this language",
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: "Translated tags for this language",
    },
  },
  {
    tableName: "blog_translations",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["blog_id", "language_code"],
        name: "unique_blog_language",
      },
      {
        fields: ["language_code"],
      },
    ],
  }
);

module.exports = BlogTranslation;
