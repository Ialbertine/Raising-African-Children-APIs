const multer = require("multer");
const { uploadToCloudinary } = require("../config/cloudinary");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

// Upload single file to Cloudinary
const uploadSingleToCloudinary = (fieldName, options = {}) => {
  return async (req, res, next) => {
    try {
      upload.single(fieldName)(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message || "File upload failed",
          });
        }

        if (req.file) {
          try {
            const uploadOptions = {
              folder: options.folder || "raising-african-children/blogs",
              resourceType: "image",
              transformation: options.transformation || [
                { width: 1200, height: 800, crop: "limit" },
                { quality: "auto" },
                { format: "auto" },
              ],
            };

            const result = await uploadToCloudinary(
              req.file.buffer,
              uploadOptions
            );

            req.cloudinaryResult = {
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            };

            req.file.cloudinaryUrl = result.secure_url;
            req.file.publicId = result.public_id;
          } catch (cloudinaryError) {
            return res.status(500).json({
              success: false,
              message: "Failed to upload file to Cloudinary",
              error: process.env.NODE_ENV === "development" ? cloudinaryError.message : undefined,
            });
          }
        }

        next();
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "File upload middleware error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
};

// Upload multiple files to Cloudinary
const uploadMultipleToCloudinary = (fieldName, maxCount = 5, options = {}) => {
  return async (req, res, next) => {
    try {
      upload.array(fieldName, maxCount)(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message || "File upload failed",
          });
        }

        if (req.files && req.files.length > 0) {
          try {
            const uploadPromises = req.files.map((file) => {
              const uploadOptions = {
                folder: options.folder || "raising-african-children/blogs",
                resourceType: "image",
                transformation: options.transformation || [
                  { width: 1200, height: 800, crop: "limit" },
                  { quality: "auto" },
                  { format: "auto" },
                ],
              };

              return uploadToCloudinary(file.buffer, uploadOptions).then(
                (result) => ({
                  url: result.secure_url,
                  publicId: result.public_id,
                  width: result.width,
                  height: result.height,
                  format: result.format,
                  bytes: result.bytes,
                  originalName: file.originalname,
                })
              );
            });

            req.cloudinaryResults = await Promise.all(uploadPromises);
          } catch (cloudinaryError) {
            return res.status(500).json({
              success: false,
              message: "Failed to upload files to Cloudinary",
              error: process.env.NODE_ENV === "development" ? cloudinaryError.message : undefined,
            });
          }
        }

        next();
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "File upload middleware error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
};

module.exports = {
  upload,
  uploadSingleToCloudinary,
  uploadMultipleToCloudinary,
};
