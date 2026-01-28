FROM node:20-alpine
# Provide CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET at runtime

# Set working directory
WORKDIR /app

# Copy package files first 
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy all application files to /app
COPY . .

# Expose port 
EXPOSE 5000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT || 5000}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
