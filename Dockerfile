# Production-ready multi-stage Dockerfile for Next.js using Node 22

# 1) Install dependencies (cached layer)
FROM node:22-bullseye-slim AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package manifests and install dependencies
COPY package.json package-lock.json ./
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && npm ci --silent

# 2) Build the application
FROM node:22-bullseye-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Copy source and node modules from deps stage
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build Next.js app
RUN npm run build

# 3) Runtime image (production)
FROM node:22-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Create unprivileged user to run the app
RUN groupadd -r nextjs && useradd -r -g nextjs -m nextjs

# Install minimal tooling for healthchecks
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy built assets and production deps
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

## Ensure correct permissions
#RUN chown -R nextjs:nextjs /app
#USER nextjs

EXPOSE 3000

# Simple HTTP healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the Next.js production server
CMD ["npm", "start"]
