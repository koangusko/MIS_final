# 部署到 toko(AWS 東京)— Docker + nginx + Cloudflare

正式環境:**https://mis.koyoze.com**(Cloudflare proxied → toko nginx → app 容器)。

## 機器
- SSH:`ssh toko`(`~/.ssh/config` 已設:`ubuntu@3.113.88.70`,key `~/.ssh/0304_key.pem`)。
- 共用機:上面還有別的服務(asdxcvw.com 各站、wg-easy 等)。本服務用獨立 compose 專案 `screenpact` 與獨立 nginx site,**不要動到既有設定**。
- 已具備:Docker + Compose、nginx 1.18、2GB swap。

## 架構
```
手機/瀏覽器 ──https──> Cloudflare(橘雲, SSL=Flexible) ──http:80──> toko nginx
                                                              └─ proxy ─> 127.0.0.1:8080 (app 容器)
app 容器 ── docker network ──> db 容器 (postgres16, db:5432)
```
- app 只綁 `127.0.0.1:8080`(不對外)。db 對本機開 `127.0.0.1:15432`(除錯用)。
- 容器內 `DATABASE_URL=...@db:5432`;migration 於容器啟動時自動 `prisma migrate deploy`。

## 首次部署 / 更新部署
1. 本機把程式碼同步上去(排除 node_modules/.git/dist/.env):
   ```bash
   rsync -az --delete \
     --exclude '.git' --exclude 'node_modules' --exclude 'dist' \
     --exclude '.env' --exclude 'data' --exclude '.claude' \
     -e ssh ./ toko:/home/ubuntu/screenpact/
   ```
2. 正式 `.env`(只在 toko、權限 600、勿入庫)— 重點:
   - `APP_BASE_URL=https://mis.koyoze.com`
   - `SESSION_SECRET`(隨機長字串)、`GOOGLE_CLIENT_ID/SECRET`
   - `POSTGRES_USER/PASSWORD/DB`(app 的 DATABASE_URL 由 compose 以 `@db:5432` 組出)
   - `TZ=Asia/Taipei`、`UPLOAD_DIR=/data/uploads`
3. 起服務(會自動 build + 跑 migration):
   ```bash
   ssh toko 'cd ~/screenpact && docker compose up -d --build'
   ```
4. nginx site `/etc/nginx/sites-available/mis.koyoze.com`(已建,symlink 到 sites-enabled):
   反代 `127.0.0.1:8080`,帶 `Host`、`X-Forwarded-For`,並把 Cloudflare 的 `X-Forwarded-Proto` 透傳給後端(登入 cookie 需要)。`client_max_body_size 20m`(截圖上傳)。
   改完務必 `sudo nginx -t` 再 `sudo systemctl reload nginx`。

## Cloudflare
- DNS:`mis` A → `3.113.88.70`,**Proxied(橘雲)**。
- SSL/TLS 模式:目前 **Flexible**(CF↔origin 走 http:80)。

## Google OAuth(Google Cloud Console)
已授權重新導向 URI 需包含:
- `https://mis.koyoze.com/api/auth/google/callback`(正式)
- `http://localhost:8088/api/auth/google/callback`(本機)

## 之後的安全強化(上線給真人前)
- 把 CF 改 **Full** + 開 AWS 安全群組 **443** + 在 nginx 加 origin 憑證(自簽走 Full,或 Cloudflare Origin 憑證走 Full strict),讓 CF↔toko 那段也加密(截圖含個資)。
- 旋轉一次 `GOOGLE_CLIENT_SECRET`(先前曾在對話中明文傳遞)。
- AWS 安全群組 inbound 建議限制 Cloudflare IP 範圍。
