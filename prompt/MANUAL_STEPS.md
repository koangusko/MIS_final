# MANUAL_STEPS.md — 需要你（人類）手動完成的步驟

> Claude Code 不處理這些（機密、第三方帳號、DNS、實機指令）。
> 慣例：對外網址用 **`https://screenpact.koyoze.com`**（要改子網域就全文一起改）。

---

## 0. 前置

1. **決定子網域**：建議 `screenpact.koyoze.com`（你已有 `koyoze.com` 在 Cloudflare）。
2. **GitHub 推送權限（用 SSH）**：Mac mini 已配置 SSH，確認以下三點：
   - SSH 公鑰已加到 GitHub（Settings → SSH and GPG keys）。若還沒：`cat ~/.ssh/id_ed25519.pub` 複製內容貼上去（沒有金鑰就先 `ssh-keygen -t ed25519`）。
   - remote 設為 SSH：`git remote set-url origin git@github.com:koangusko/MIS_final.git`
   - 測試：`ssh -T git@github.com`，看到 "successfully authenticated" 即可。
3. **時區**：部署時確認容器 `TZ=Asia/Taipei`（compose 已設）。

---

## 1. Google OAuth（Google Cloud Console）

1. 建立專案 → 「OAuth 同意畫面」：User Type 選 External，填 App 名稱/支援信箱；測試階段把自己加進 Test users（或之後再發布）。
2. 「憑證」→ 建立 OAuth 2.0 用戶端 ID → 類型 **Web application**。
3. **授權的重新導向 URI** 填兩個：
   - `https://screenpact.koyoze.com/api/auth/google/callback`
   - `http://localhost:8080/api/auth/google/callback`（本機開發用）
4. 取得 **Client ID / Client Secret** → 填入 `.env` 的 `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`。

---

## 2. OpenCode（Go）/ Qwen3.7 Max

1. 取得 OpenCode API 金鑰 → `.env` 的 `OPENCODE_API_KEY`。
2. 確認可用的 **base URL** → `OPENCODE_BASE_URL`。
3. 確認 **模型 id**（例：`qwen3.7-max` 之類的確切字串）→ `LLM_MODEL`。
4. **先驗一張**：拿一張螢幕使用時間截圖，用 curl 測影像輸入格式（base64 data URL 或 hosted url）與回傳，確認能穩定讀出「Threads 30分 / IG 11分」這種小字。把可用格式回報給 Claude Code 對接。

---

## 3. LINE Messaging API（LINE Developers）

1. 建立 Provider → 建立 **Messaging API** channel。
2. 取得 **Channel secret** → `.env` 的 `LINE_CHANNEL_SECRET`。
3. 發行 **Channel access token（long-lived）** → `.env` 的 `LINE_CHANNEL_ACCESS_TOKEN`。
4. **Webhook URL** 設為：`https://screenpact.koyoze.com/api/line/webhook` → 開啟「Use webhook」。
5. 關閉「自動回應訊息 / 歡迎訊息」（避免干擾 bot 邏輯）。
6. 用 QR 把 bot 加為好友（測試推播用）。
7. 綁定流程（程式會做）：web「我的」頁產生綁定碼 → 使用者把碼傳給 bot → 後端把 `line_user_id` 綁到帳號。

> ⚠️ Webhook 要等到對外 HTTPS 通了（Phase 7 之後）才會驗證成功。可先填，之後再回來按「Verify」。

---

## 4. 環境變數 `.env`

1. 從 `.env.example` 複製成 `.env`，填入上面取得的真值。
2. **絕不 commit `.env`**。
3. 必填重點：
   - `APP_BASE_URL=https://screenpact.koyoze.com`（本機開發時可暫用 `http://localhost:8080`）
   - `DATABASE_URL`、`SESSION_SECRET`（隨機長字串）
   - `GOOGLE_*`、`OPENCODE_*`、`LINE_*`、`TZ=Asia/Taipei`
4. 改 `.env` 後要 **重啟容器** 才生效。

---

## 5. 部署 A — Mac mini（OrbStack）+ Cloudflare Tunnel

> 目的：即使在家用網路，也讓 Google OAuth callback 與 LINE webhook 有公開 HTTPS 可用。用 Tunnel 不必開 port forwarding。

在 **Mac mini** 上：

1. 安裝：`brew install cloudflared`
2. 登入授權 `koyoze.com`：`cloudflared tunnel login`
3. 建立 tunnel：`cloudflared tunnel create screenpact`（記下 tunnel ID 與憑證檔路徑）
4. 綁 DNS（自動建立 CNAME）：`cloudflared tunnel route dns screenpact screenpact.koyoze.com`
5. 建 `~/.cloudflared/config.yml`（Claude Code 會給範本），ingress 指到容器：
   ```yaml
   tunnel: <TUNNEL_ID>
   credentials-file: /Users/<you>/.cloudflared/<TUNNEL_ID>.json
   ingress:
     - hostname: screenpact.koyoze.com
       service: http://localhost:8080
     - service: http_status:404
   ```
6. 用 OrbStack 起服務：`docker compose up -d --build`
7. 跑 tunnel：`cloudflared tunnel run screenpact`（或裝成背景服務）
8. 開 `https://screenpact.koyoze.com` 驗證；回 LINE/Google 後台確認 callback / webhook 正常。

> Cloudflare 端：Tunnel 會自動建立 CNAME，**不需手動加 A 記錄**。

---

## 6. 部署 B — AWS Lightsail（Docker）+ nginx + TLS

在 **Lightsail** 上（之後轉移時）：

1. **Cloudflare DNS**：新增 A 記錄 `screenpact` → Lightsail 靜態公網 IP。
   - 走 certbot（Let's Encrypt HTTP-01）取憑證 → 先設 **DNS only（灰雲）**；發完憑證可再決定是否轉橘雲。
   - 或用 **Cloudflare Origin Certificate + 橘雲 proxied**（免 certbot）。
2. **Lightsail 防火牆**：開放 80 / 443。
3. 起容器：`docker compose up -d --build`（app 只監聽 `127.0.0.1:8080`）。
4. **host nginx 反向代理**（Claude Code 會給 server block 範本），重點：
   - `proxy_pass http://127.0.0.1:8080;`
   - 帶上 `X-Forwarded-Proto $scheme;`、`X-Forwarded-For`、`Host`（OAuth/cookie 需要）
   - 放大 `client_max_body_size`（截圖上傳，建議 ≥ 15m）
5. TLS：`sudo certbot --nginx -d screenpact.koyoze.com`（若走 certbot 路線）。
6. **資料搬遷**：Mac mini 上 `pg_dump` → Lightsail `psql` 還原；上傳檔的 volume 一併搬。
7. 把 `.env` 的 `APP_BASE_URL` 維持同一網址即可（沒換網域就不必改 Google/LINE 後台）。
8. 確認 nginx 與容器都正常後，切流量。

---

## 7. 換網址/金鑰後的回填清單
若日後換子網域或重發金鑰，記得同步：
- Google OAuth 重新導向 URI
- LINE Webhook URL
- `.env` 的 `APP_BASE_URL` 與對應金鑰，並重啟容器
