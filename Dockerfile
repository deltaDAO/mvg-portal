# --- Base stage with shared tools ---
FROM node:22-alpine3.18 AS base
WORKDIR /app

# Install bash and git (needed for build and pregenerate scripts)
RUN apk add --no-cache bash git

# --- Dependencies stage ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# --- Builder stage (runs scripts & build) ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Production runner (slim, fast) ---
FROM node:22-alpine3.18 AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Only install production deps for speed
RUN npm ci --omit=dev

EXPOSE 8008

CMD ["npm", "run", "start"]
