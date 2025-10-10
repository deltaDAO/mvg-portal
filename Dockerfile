FROM node:22-bookworm AS base
WORKDIR /app

RUN apt-get update && apt-get install -y \
  bash \
  git \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
    
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build-docker

FROM node:22-bookworm AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

RUN npm ci --omit=dev --ignore-scripts
EXPOSE 8008

CMD ["npm", "run", "start-docker"]
