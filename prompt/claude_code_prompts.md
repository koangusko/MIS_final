# Claude Code 分階段提示詞

使用方式：
1. 先把 `CLAUDE.md`、`MANUAL_STEPS.md`、`.env.example` 放進 repo 根目錄（Phase 0 會處理）。
2. 一次只貼一個 Phase 給 Claude Code，跑完驗證 OK 再貼下一個。
3. 每個 Phase 結尾都要求 commit + push（已寫進提示詞）。
4. 遇到需要金鑰/DNS/後台設定時，Claude Code 會請你照 `MANUAL_STEPS.md` 處理。

---

## Phase 0 — 初始化倉庫與骨架

```
讀根目錄的 CLAUDE.md，遵守其中所有規範。

任務：初始化專案骨架。
- remote 用 SSH：git@github.com:koangusko/MIS_final.git（先確認 `git remote -v` 是這個 SSH URL，不是的話 `git remote set-url origin git@github.com:koangusko/MIS_final.git`；接著 pull，可能只有 README）。
- 建立 monorepo 結構：/web（Vite + React + TS + Tailwind）、/server（Express + TS + Prisma）、根目錄 docker-compose.yml、Dockerfile（multi-stage，先放骨架）、.env.example、.gitignore、docs/。
- .gitignore 必須涵蓋：.env、node_modules、dist、/server/prisma/*.db、uploads、*.pem、.cloudflared。
- .env.example 列出 CLAUDE.md 提到的所有變數（值留空）：APP_BASE_URL、PORT、DATABASE_URL、SESSION_SECRET、GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET、OPENCODE_API_KEY、OPENCODE_BASE_URL、LLM_MODEL、LINE_CHANNEL_SECRET、LINE_CHANNEL_ACCESS_TOKEN、UPLOAD_DIR、TZ。
- web 與 server 各自能 `dev` 啟動的最小範例。
- 完成後：建置確認 → commit（chore: scaffold monorepo）→ push origin main。
```

---

## Phase 1 — 前端：套用 ScreenPact 設計

```
讀 CLAUDE.md。本階段只做前端，用假資料（mock）與路由，不接後端。

先抓設計並實作：
Fetch this design file, read its readme, and implement the relevant aspects of the design. https://api.anthropic.com/v1/design/h/WuMu_5FjDkjqOj96kduCSA?open_file=%E6%99%82%E9%96%93%E5%85%AC%E7%B4%84+ScreenPact.html
Implement: 時間公約 ScreenPact.html

要求：
- 在 /web 以 React + Vite + TS + Tailwind 實作，行動優先 RWD，建立可重用元件與設計 token（色彩/字體/圓角，對齊設計）。
- 完成這些畫面（先用 mock 資料）：登入頁、個人總覽 Dashboard（無資料/有資料兩態）、每日上傳回報（空/解析中/成功/失敗要求重傳 四態，失敗態要顯示失敗截圖縮圖與重傳鈕）、房間詳情（成員/規則/排行/聊天 分頁）、建立房間+邀請成功頁（QR+連結）、加入房間預覽頁（含連結失效態）。
- 底部導覽：總覽/房間/上傳(中央大鈕)/通知/我的。
- 完成後：web build 通過 → commit（feat(web): implement ScreenPact P0 screens）→ push。
```

---

## Phase 2 — 後端基礎 + DB + Google 登入

```
讀 CLAUDE.md。

任務：
- /server 建 Express + TS；用 Prisma 定義 schema（依需求：User, Room, RoomMember, AppCatalog, TrackedApp, Rule, Proposal, Vote, Submission, ExtractedUsage, SettlementResult, ChatMessage；含 User.line_user_id）。建立首個 migration。
- docker-compose 加入 postgres 服務 + volume；server 連 DATABASE_URL。
- 實作 Google OAuth（passport-google-oauth20）+ express-session（httpOnly cookie，session 用 connect-pg-simple 存 Postgres）：/api/auth/google、/api/auth/google/callback、/api/auth/logout、GET /api/me。
- server 同時 serve /web 的建置產物（單一 origin）；未登入導向登入。
- 把前端登入頁接上真實 Google 登入流程，/api/me 帶出使用者。
- Google 憑證請我依 MANUAL_STEPS 第 1 步準備；你只讀環境變數。
- 完成後：建置通過、本機可登入 → commit（feat(server): google oauth + prisma schema）→ push。
```

---

## Phase 3 — 每日截圖上傳 + LLM 解析

```
讀 CLAUDE.md。

任務：
- 上傳 API：接「昨天完整」「今天」兩張圖，存到 UPLOAD_DIR（私有 volume），multer 處理，限型別/大小。
- services/llm.ts：呼叫 OpenCode（Go）的 Qwen3.7 Max 解析截圖，回傳結構化 JSON（各 App 分鐘、總時數、分類總和、日期）。嚴格要求只回 JSON 並安全解析。
- 失敗處理：若無法辨識（非螢幕使用時間頁/讀不出數字）→ 標記 need_reupload，回傳該失敗圖的引用，讓前端顯示失敗縮圖與重傳鈕。
- 解析結果存 Submission / ExtractedUsage；個人 Dashboard 改吃真實資料（日/週、各 App 對上限進度）。
- 截圖讀取路由要驗證、僅限本人。
- LLM 金鑰/格式我依 MANUAL_STEPS 第 2 步提供；你只讀環境變數。
- 完成後：本機可上傳並看到解析或重傳 → commit（feat: screenshot upload + qwen vision parsing）→ push。
```

---

## Phase 4 — 房間 + 邀請/QR + 追蹤清單

```
讀 CLAUDE.md。

任務：
- 房間 CRUD：建立（名稱、結算週期 日/週、回報截止時間、說明）、成員加入。
- 邀請：產生 join token（有效期 7 天、可重新產生、不限人數），對應 QR（qrcode 套件）。加入流程：預覽頁（含失效態）→ 確認加入。
- 追蹤清單：seed 一份 AppCatalog（IG/Threads/TikTok/YouTube/FB/X/小紅書/Dcard…，標 social/shortvideo/other）；房主可勾選 TrackedApp。
- 前端接上：建立房間+邀請成功頁、加入預覽頁、房間詳情的成員/規則分頁、追蹤清單設定（房主）。
- 完成後 → commit（feat: rooms, invite link/qr, tracked apps）→ push。
```

---

## Phase 5 — 規則、投票、結算

```
讀 CLAUDE.md。

任務：
- 規則：每房對單一 App 或分類設上限；懲罰為自訂文字。
- 投票：成員發起提案（改上限/改懲罰），贊成數 ≥ 半數通過，房主無否決權；通過於下一結算週期生效。
- 結算：node-cron 依各房週期（日/週）與回報截止時間結算；超標→套用自訂懲罰；未回報→視為失敗（同樣受罰）。產生 SettlementResult 與排行榜。
- 時區一律 Asia/Taipei，日/週與「昨天」以台北時間計。
- 前端接上：規則與投票頁、排行、結算結果頁。
- 完成後 → commit（feat: rules, voting, scheduled settlement）→ push。
```

---

## Phase 6 — 房間聊天室 + LINE bot

```
讀 CLAUDE.md。

任務：
- 房間聊天室：成員發言 + 系統公告（kind=system）。系統事件自動發公告：追蹤清單變更、截止時間變更、投票發起/結果、結算結果、誰超標/未回報/被罰。前端聊天分頁顯示泡泡與公告卡。
- LINE：/api/line/webhook（驗 X-Line-Signature）；綁定流程（web 產綁定碼 → 使用者傳給 bot → 綁 line_user_id）；把上述系統公告透過 push 推給已綁定成員。
- 即時性：MVP 先用輪詢即可（聊天每數秒拉一次），先別上 WebSocket。
- LINE 憑證與 webhook 設定我依 MANUAL_STEPS 第 3 步處理；你只讀環境變數並提醒我去後台設 webhook。
- 完成後 → commit（feat: room chat + line bot notifications）→ push。
```

---

## Phase 7 — Docker 化 + Mac mini（OrbStack）上線

```
讀 CLAUDE.md。

任務：
- 完成 multi-stage Dockerfile（build web → build server → 精簡 runtime，單一映像），docker-compose.yml（app + postgres + volume，app 對外只在需要時映射；含 healthcheck、TZ、restart policy）。
- app 預設監聽 8080，讀 APP_BASE_URL 等環境變數。
- 產生 ~/.cloudflared/config.yml 範本與啟動說明（ingress → http://localhost:8080），寫進 docs/deploy-macmini.md，並更新 MANUAL_STEPS 第 5 步若有差異。
- 不要嘗試自己登入 Cloudflare 或處理憑證；產出範本與步驟讓我手動跑（brew install cloudflared / tunnel login / route dns / run）。
- 本機 `docker compose up -d --build` 能起來、健康檢查通過。
- 完成後 → commit（chore: dockerize + cloudflare tunnel for mac mini）→ push。
```

---

## Phase 8 — 轉移到 AWS Lightsail（nginx + TLS）

```
讀 CLAUDE.md。

任務：
- 提供 host nginx server block 範本（反代到 127.0.0.1:8080，帶 X-Forwarded-Proto/For、Host，client_max_body_size ≥ 15m），寫進 docs/deploy-lightsail.md。
- 調整 compose 讓 app 只綁 127.0.0.1:8080（由 host nginx 對外）。
- 寫資料搬遷步驟：pg_dump（Mac mini）→ psql 還原（Lightsail）+ 上傳檔 volume 搬移。
- 更新 MANUAL_STEPS 第 6 步（Cloudflare A 記錄、防火牆 80/443、certbot 或 Origin Cert 二選一）。
- 不要自己操作 Lightsail/Cloudflare/certbot；產出設定範本與我要跑的指令清單即可。APP_BASE_URL 不變則 Google/LINE 後台免動。
- 完成後 → commit（docs: lightsail nginx deploy + data migration）→ push。
```
