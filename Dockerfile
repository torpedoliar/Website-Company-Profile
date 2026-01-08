# ===========================================
# Company Profile Website - Dockerfile
# ===========================================
# Single-stage build for simpler deployment

FROM node:20-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache openssl libc6-compat wget

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create uploads directory
RUN mkdir -p /app/public/uploads

# Expose port
EXPOSE 3000

# Copy and make entrypoint executable
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Start with entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "start"]
