# Stage 1: Build TypeScript application
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# Stage 2: Production runner
FROM node:22-alpine AS runner

# Install ffmpeg for video audio extraction (used by AI video scoring)
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

# Create uploads directory structure
RUN mkdir -p /app/uploads/images /app/uploads/videos /app/uploads/docs

EXPOSE 8000

ENV NODE_ENV=production
ENV PORT=8000

CMD ["node", "dist/server.js"]
