# --- Base stage with shared tools ---
FROM node:22-bookworm AS base
WORKDIR /app

# Install build tooling required by npm/node-gyp (bash, git, python, compiler toolchain)
RUN apt-get update && apt-get install -y \
  bash \
  git \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

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
FROM node:22-bookworm AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install build tooling required by npm/node-gyp (python, compiler toolchain)
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/scripts ./scripts 
COPY --from=builder /app/content ./content 
COPY --from=builder /app/node_modules ./node_modules 

# Only install production deps for speed
RUN npm ci --omit=dev --ignore-scripts

EXPOSE 8008

CMD ["npm", "run", "start"]