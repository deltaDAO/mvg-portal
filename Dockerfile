# Base stage: install dependencies only when needed
FROM node:22-alpine3.18 AS deps
WORKDIR /app

# Install build dependencies required by node-gyp and native modules
RUN apk add --no-cache python3 make g++ bash

# Install dependencies (with caching for lock file)
COPY package.json package-lock.json* ./
RUN npm ci

# Builder stage: copy app and build it
FROM node:22-alpine3.18 AS builder
WORKDIR /app

# Also install bash in the builder stage for scripts
RUN apk add --no-cache bash

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production stage: run the app with minimal image
FROM node:22-alpine3.18 AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy your .env file if needed for production configurations
# COPY .env .env

EXPOSE 8008

CMD ["npm", "run", "start"]
