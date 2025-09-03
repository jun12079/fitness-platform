# Fitness Platform

健身教練預約與課程管理平台，支援教練、學員、課程、技能、點數包等功能，並整合 PostgreSQL 資料庫與 Docker 部署。

## 目錄

- [專案簡介](#專案簡介)
- [技術棧](#技術棧)
- [目錄結構](#目錄結構)
- [安裝與啟動](#安裝與啟動)
- [環境變數](#環境變數)
- [Docker 部署](#docker-部署)
- [API 路由簡介](#api-路由簡介)
- [授權](#授權)

---

## 專案簡介

本平台提供健身教練與學員的預約、課程管理、技能管理、點數購買等功能，後端採用 Node.js + Express，資料庫使用 PostgreSQL，並支援 Docker 一鍵部署。

## 技術棧

- Node.js 20
- Express
- TypeORM
- PostgreSQL
- Docker / docker-compose
- JWT 驗證
- ESLint (Standard)
- Pino 日誌
- bcrypt 密碼加密

## 目錄結構

```
app.js                # Express 主程式
bin/www.js            # 伺服器啟動入口
controllers/          # 業務邏輯
routes/               # API 路由
entities/             # TypeORM 資料表定義
db/                   # 資料庫連線設定
config/               # 環境與設定檔
middlewares/          # Express 中介層
utils/                # 工具函式
Dockerfile            # Docker 映像檔設定
docker-compose.yml    # Docker 容器編排
.env.example          # 環境變數範例
```

## 安裝與啟動

1. 安裝相依套件

	```bash
	npm ci
	```

2. 設定環境變數（可參考 `.env.example`）

3. 啟動開發伺服器

	```bash
	npm run dev
	```

4. 使用 Docker 啟動（含資料庫）

	```bash
	npm run start
	```

## 環境變數

請參考 `.env.example`，主要包含：

- 資料庫設定：`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- JWT 設定：`JWT_SECRET`, `JWT_EXPIRES_DAY`
- 伺服器設定：`PORT`, `LOG_LEVEL`
- PostgreSQL 容器設定：`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

## Docker 部署

- 直接執行 `npm run start` 即可啟動所有服務（Node.js 與 PostgreSQL）。
- 相關設定請參考 `docker-compose.yml` 與 `Dockerfile`。

## API 路由簡介

- `/api/users`：註冊、登入、個人資料、購買點數、課程查詢
- `/api/coaches`：教練列表、教練課程
- `/api/courses`：課程列表、報名、取消
- `/api/credit-package`：點數包查詢、購買
- `/api/admin`：教練管理、課程管理、營收查詢
- `/api/coaches/skill`：技能查詢、管理

詳細 API 請參考各路由檔案與 controller 實作。

## 開發指令

- `npm run dev` - 啟動開發伺服器
- `npm run start` - 啟動伺服器與資料庫
- `npm run restart` - 重新啟動伺服器與資料庫
- `npm run stop` - 關閉啟動伺服器與資料庫
- `npm run clean` - 關閉伺服器與資料庫並清除所有資料
