# Base stage for dependencies
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN if [ -f next.config.js ]; then \
      echo "Updating next.config.js to support output: 'standalone' and proper host binding"; \
      sed -i '/module.exports/a\  output: "standalone",\n  experimental: {\n    ...((config) => config?.experimental || {})(),\n  },\n' next.config.js; \
    else \
      echo "module.exports = {\n  output: \"standalone\",\n  experimental: {}\n};" > next.config.js; \
    fi

# Generate Prisma client
RUN pnpm exec prisma generate

# Build the application
RUN pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets and dependencies
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set correct permissions
USER nextjs

# Expose port
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"]