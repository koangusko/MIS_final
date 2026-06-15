# syntax=docker/dockerfile:1

# ── 1) 建置前端 ──────────────────────────────
FROM node:20-alpine AS web-build
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# ── 2) 建置後端 ──────────────────────────────
FROM node:20-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npx prisma generate
RUN npm run build

# ── 3) Runtime（精簡單一映像）────────────────
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/prisma ./prisma
COPY --from=server-build /app/server/node_modules/.prisma ./node_modules/.prisma
COPY --from=web-build /app/web/dist /app/web/dist
EXPOSE 8080
CMD ["node", "dist/index.js"]
