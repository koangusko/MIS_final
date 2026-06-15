# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 目前狀態（重要）
這個 repo **尚未 scaffold 程式碼**，目前只有 `prompt/` 下的規劃文件。實際開發要從 `prompt/claude_code_prompts.md` 的 **Phase 0** 開始，依序執行各 Phase 把骨架與功能建出來。在動工前，務必先讀以下三份檔案，它們是這個專案的單一事實來源（SSOT）：

- **`prompt/CLAUDE.md`** — 專案最高指引（技術選型、結構、安全/隱私、DoD、Git 規範）。本檔是它的摘要與索引；兩者衝突時以 `prompt/CLAUDE.md` 為準。
- **`prompt/claude_code_prompts.md`** — Phase 0–8 的逐階段提示詞。一次只做一個 Phase，跑完驗證 OK 再做下一個。
- **`prompt/MANUAL_STEPS.md`** — 需要「人類」手動完成的步驟（金鑰、DNS、第三方後台、實機部署指令）。

> ⚠️ 注意：`prompt/CLAUDE.md` 描述的 `/web`、`/server`、`Dockerfile`、`docker-compose.yml`、`.env.example` 等目前都還不存在 — 它們是 Phase 0 起要建立的目標結構，不要假設它們已經在 repo 裡。

## 專案是什麼
**時間公約 ScreenPact**：社群／短影音「使用時間」互助管理 Web App。使用者每天上傳 iPhone「螢幕使用時間」截圖 → 多模態 LLM 解析各 App 時數 → 在「房間」內由房主設定追蹤的 App、共同上限與懲罰 → 按日/週結算、超標依房間自訂懲罰處理。房間內建聊天室，並透過 LINE bot 推播通知。

## 技術選型（要更動先問 koyoze）
- **前端**：React + Vite + TypeScript + Tailwind（行動優先 RWD），建置為靜態檔由後端 serve。
- **後端**：Node.js 20 + Express + TypeScript + Prisma。
- **DB**：PostgreSQL 16（容器），schema 以 Prisma migration 管理。
- **Auth**：Google OAuth 2.0（passport-google-oauth20）+ express-session（httpOnly cookie，session 用 connect-pg-simple 存 Postgres）。
- **多模態 LLM**：OpenCode（Go）API，模型走影像輸入；封裝在 `server/src/services/llm.ts`，model 與 base URL 走環境變數。
- **LINE**：@line/bot-sdk（webhook 接收 + push 推播）。
- **截圖儲存**：本機 volume（`UPLOAD_DIR`，預設 `/data/uploads`），私有、僅本人可存取。
- **排程**：node-cron 做到期結算。**QR**：`qrcode` 套件。

## 架構大圖（讀懂這幾點才好動手）
- **單一映像、單一 origin**：multi-stage Dockerfile（build web → build server → runtime），後端同時 serve 前端建置產物。前後端共用同一 origin，避免 OAuth/cookie 的跨網域問題。
- **`APP_BASE_URL` 是設定的單一來源**：OAuth callback、LINE webhook、邀請連結全部由它組出來。Mac mini 與 Lightsail 兩個部署環境，**程式碼與映像完全相同**，只差 `APP_BASE_URL` 與「邊層」（Cloudflare Tunnel vs host nginx）。
- **時區一律 `Asia/Taipei`（`TZ` env）**：日/週邊界與「昨天」一律用台北時間計，結算邏輯依此。
- **資料模型（Prisma，Phase 2 建立）**：User（含 `line_user_id`）, Room, RoomMember, AppCatalog, TrackedApp, Rule, Proposal, Vote, Submission, ExtractedUsage, SettlementResult, ChatMessage。
- **投票治理**：成員提案（改上限/改懲罰），贊成 ≥ 半數通過，房主無否決權，通過於下一結算週期生效。
- **聊天室 + 系統公告**：系統事件（追蹤清單/截止時間變更、投票發起與結果、結算、誰超標/未回報/被罰）自動發 `kind=system` 公告，並透過 LINE push 推給已綁定成員。MVP 即時性用輪詢，先不上 WebSocket。

## 開發工作流程（每個 Phase 都遵守）
1. **動工前先讀 `prompt/CLAUDE.md`**，並對照當前 Phase 的提示詞。
2. 一次只做一個 Phase（見 `prompt/claude_code_prompts.md`）。
3. **每階段完成定義（DoD）**：`web` 與 `server` 都建置通過、本機可啟動；功能可手動驗證（在輸出寫明「怎麼驗」）；若新增環境變數→更新 `.env.example`，若新增手動步驟→更新 `MANUAL_STEPS.md`。
4. **每完成一個 Phase 就 commit + push**，用 Conventional Commits（feat/fix/chore/docs/refactor），訊息範例見各 Phase 結尾。

> 預期常用指令（Phase 0 scaffold 之後才會存在，目前 repo 還沒有 package.json / Dockerfile）：
> - 全端本機起服務：`docker compose up -d --build`（app 預設監聽 `8080`）
> - DB schema 變更：Prisma migration（在 `/server`）
> - 前端 / 後端各自的 `dev` 與 `build`（scripts 在各自 package.json）
> 實際指令以 Phase 0 建出的 package.json scripts 與 compose 設定為準。

## Git
- Remote（SSH）：`git@github.com:koangusko/MIS_final.git`，主分支 `main`。
- **絕不 commit 機密**：`.env`、cloudflared 憑證、`uploads/`、`node_modules`、`dist`、`*.pem`、`.cloudflared`。動工先確保 `.gitignore` 覆蓋。
- push 失敗多半是 SSH key 未加到 GitHub — 這屬人類手動步驟（`MANUAL_STEPS.md` 第 0 步），不要嘗試自己處理憑證。

## 人類 vs Claude Code 的分工
- **Claude Code 負責**：寫程式、Dockerfile、compose、nginx/cloudflared 設定「範本」、跑 Prisma migration、本機建置與測試。
- **人類負責（見 `MANUAL_STEPS.md`）**：Cloudflare DNS/Tunnel 授權、Google OAuth 憑證、LINE 頻道設定、OpenCode 金鑰、GitHub 推送權限、實機部署指令的執行、填寫真實 `.env`。
- Claude Code **不處理**機密與第三方帳號設定；需要時在輸出提示「請依 MANUAL_STEPS 第 X 步手動完成」，只讀環境變數、不填真值。

## 安全與隱私（硬性）
- 截圖含個資：存私有 volume、不自動刪除；上傳/讀取路由必須驗證且**僅限本人**存取。
- 任何金鑰只存在後端環境變數，**不得**出現在前端或被 commit。
- LINE webhook 必須驗證簽章（`X-Line-Signature`）。

## 部署兩階段（細節見 `MANUAL_STEPS.md` 與 prompts Phase 7/8）
1. **Mac mini（OrbStack Docker）+ Cloudflare Tunnel** → `screenpact.koyoze.com`。
2. **AWS Lightsail（Docker）+ host nginx 反向代理 + TLS**；Cloudflare DNS A 記錄指向 Lightsail IP。
