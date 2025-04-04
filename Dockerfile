# Base stage for dependencies
FROM node:20-alpine AS base

ARG ASSET_PREFIX
ARG NEXT_PUBLIC_ASSET_PREFIX

ENV ASSET_PREFIX=${ASSET_PREFIX}
ENV NEXT_PUBLIC_ASSET_PREFIX=${NEXT_PUBLIC_ASSET_PREFIX}

# Add echo statements to verify
RUN echo "ASSET_PREFIX: $ASSET_PREFIX"
RUN echo "NEXT_PUBLIC_ASSET_PREFIX: $NEXT_PUBLIC_ASSET_PREFIX"


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
EXPOSE 8085
ENV PORT 8085
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"]