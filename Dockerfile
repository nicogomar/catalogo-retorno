# Multi-stage build for Node.js backend and Angular frontend
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY api/package*.json ./api/
COPY App/package*.json ./App/

# Install dependencies
RUN npm ci --include=dev

# Build backend
WORKDIR /app/api
RUN npm run build

# Build frontend
WORKDIR /app/App
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set working directory for Render
WORKDIR /opt/render/project/src

# Copy package files for production
COPY package*.json ./
COPY api/package*.json ./api/

# Install only production dependencies
RUN npm ci --only=production

# Copy built backend
COPY --from=builder /app/api/dist ./api/dist

# Copy built frontend to the expected location
COPY --from=builder /app/App/dist/app/browser ./public

# Copy API source files
COPY api/src ./api/src

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "api/dist/index.js"]
