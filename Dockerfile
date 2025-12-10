FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app


FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* ./

RUN npm install --legacy-peer-deps

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN apk add --no-cache bash git
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8008
ENV PORT=8008
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
