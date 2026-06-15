# CLAUDE.md — 時間公約 ScreenPact

> 這是專案的最高指引。請在每個任務開始前讀過本檔，並遵守其中規範。

## 專案概述
社群／短影音使用時間互助管理 Web App。使用者每天上傳 iPhone「螢幕使用時間」截圖，多模態 LLM 解析各 App 時數；在「房間」內由房主決定追蹤哪些 App、房間共同設上限與懲罰、按日/週結算、超標依房間自訂懲罰處理；房間內建聊天室，並透過 LINE bot 推播通知。

## 技術選型（請遵循；要更動先問我）
- **前端**：React + Vite + TypeScript + Tailwind CSS（行動優先 RWD）。建置為靜態檔，由後端 serve。
- **後端**：Node.js 20 + Express + TypeScript + Prisma。
- **DB**：PostgreSQL 16（容器）。schema 以 Prisma migration 管理。
- **Auth**：Google OAuth 2.0（passport-google-oauth20）+ express-session（httpOnly cookie，session 存 Postgres，用 connect-pg-simple）。
- **多模態 LLM**：OpenCode（Go）API，模型 Qwen3.7 Max（影像輸入），封裝在 `server/src/services/llm.ts`，model 與 base url 走環境變數。
- **LINE**：@line/bot-sdk（webhook 接收 + push 推播）。
- **截圖儲存**：本機 volume（`UPLOAD_DIR`，預設 `/data/uploads`），私有、僅本人可存取；未來可換 Cloudflare R2。
- **排程**：node-cron 做到期結算。
- **QR**：`qrcode` npm 套件。
- **時區**：全程 `Asia/Taipei`（`TZ` env）。日/週邊界、「昨天」一律以台北時間計。

## 專案結構
```
/web                前端（Vite + React）
/server             後端（Express + Prisma），含 prisma/
Dockerfile          multi-stage：build web → build server → runtime（單一映像）
docker-compose.yml  服務：app + db（+ volume）
.env.example        所有環境變數範本（值留空，勿填真值）
.gitignore
CLAUDE.md
MANUAL_STEPS.md     人類手動步驟清單
docs/               其他文件
```

## 單一來源設定（12-factor）
所有環境差異走環境變數，最關鍵：
- `APP_BASE_URL`：對外 HTTPS 網址（OAuth callback、LINE webhook、邀請連結都依它組）。
Mac mini 與 Lightsail 只差 `APP_BASE_URL` 與「邊層」（Cloudflare Tunnel vs host nginx），**程式碼與 Docker 映像不變**。

## Git 規範（重要）
- Remote：`git@github.com:koangusko/MIS_final.git`（SSH），主分支 `main`。
- **每完成一個任務/階段就 `commit` 並 `push`**。用 Conventional Commits（feat/fix/chore/docs/refactor）。
- **絕不 commit 機密**：`.env`、cloudflared 憑證、`uploads/`、`node_modules`、`dist`、`*.pem`。先確保 `.gitignore` 覆蓋。
- push 失敗多半是 SSH key 沒加到 GitHub（人類需先把 Mac mini 的 SSH 公鑰加進 GitHub，見 MANUAL_STEPS 第 0 步）。

## 人類負責 vs Claude Code 負責
- **Claude Code**：寫程式、Dockerfile、compose、nginx/cloudflared 設定「範本」、跑 Prisma migration、本機建置與測試。
- **人類手動**（見 `MANUAL_STEPS.md`）：Cloudflare DNS/Tunnel 登入授權、Google OAuth 憑證、LINE 頻道設定、OpenCode 金鑰、GitHub 推送權限、實機部署指令的執行、填寫真實 `.env`。
- Claude Code **不要也不應**處理上述機密與第三方帳號設定；需要時在輸出中提示「請依 MANUAL_STEPS 第 X 步手動完成」。

## 每階段完成定義（DoD）
1. `web` 與 `server` 都能建置通過、本機可啟動。
2. 該階段功能可手動驗證（在輸出中寫明「怎麼驗」）。
3. 若新增環境變數 → 更新 `.env.example`；若新增手動步驟 → 更新 `MANUAL_STEPS.md`。
4. `commit` + `push`。

## 部署兩階段
1. **Mac mini（OrbStack Docker）** + Cloudflare Tunnel → `screenpact.koyoze.com`。
2. **AWS Lightsail（Docker）** + host nginx 反向代理 + TLS；Cloudflare DNS A 記錄指向 Lightsail IP。
細節見 `MANUAL_STEPS.md` 與 prompts 的 Phase 7 / 8。

## 安全與隱私
- 截圖含個資，保留不自動刪除，存私有 volume，上傳/讀取路由必須驗證且僅限本人。
- 任何金鑰只存在後端環境變數，**不得**出現在前端或被 commit。
- LINE webhook 必須驗證簽章（X-Line-Signature）。

## 設計來源
前端畫面實作以 Claude Design 產出的 `時間公約 ScreenPact.html` 為準（fetch 指令見 prompts Phase 1）。
