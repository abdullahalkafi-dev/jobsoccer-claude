FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables for Next.js inlining
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_HOSTNAME
ARG NEXT_PUBLIC_PORT
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_CLIENT_ID
ARG NEXT_PUBLIC_PRIMARY_CLIENT_SECRET
ARG NEXT_PUBLIC_LINKEDIN_REDIRECT_URI

ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_HOSTNAME=$NEXT_PUBLIC_HOSTNAME
ENV NEXT_PUBLIC_PORT=$NEXT_PUBLIC_PORT
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_CLIENT_ID=$NEXT_PUBLIC_CLIENT_ID
ENV NEXT_PUBLIC_PRIMARY_CLIENT_SECRET=$NEXT_PUBLIC_PRIMARY_CLIENT_SECRET
ENV NEXT_PUBLIC_LINKEDIN_REDIRECT_URI=$NEXT_PUBLIC_LINKEDIN_REDIRECT_URI
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
