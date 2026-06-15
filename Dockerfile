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
COPY server/prisma ./prisma
# prisma 為 prod 相依，npm ci 後產生 client；migrate 於啟動時執行
RUN npm ci --omit=dev && npx prisma generate
COPY --from=server-build /app/server/dist ./dist
COPY --from=web-build /app/web/dist /app/web/dist
EXPOSE 8080
# 啟動前先套用 migration（正式環境連 db 服務），再啟動 server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
