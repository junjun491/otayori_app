# ローカル開発環境

ローカルでは以下の構成で起動します。

- DB：Docker
- Rails API：ローカル（3001）
- Next.js：ローカル（3000）

## 1. DB起動

```
cd backend
docker compose up -d
```

## 2. Rails API 起動

```
cd backend
bundle install
bin/rails db:prepare
bin/rails s -p 3001
```

確認：

```
curl http://localhost:3001/api/healthz
```

## 3. Next.js 起動

```
cd frontend
npm install
npm run dev
```

アクセス：

- http://localhost:3000/login

## API設計

- `/api/*` に統一
- ローカル：Next.js rewrites
- 本番：ALB ルーティング

## 意識したこと

- ローカルはシンプルに（DBのみDocker）
- ローカルでは Next.js の rewrites が ALB の代わりにリクエストの振り分けを担当していて、
  本番と同じような責務分離（リクエストの振り分け・フロント・API）になるように設計しています。

### ローカル

Browser
↓
Next.js（rewrites）
↓
└── /api/\* → Rails API

### 本番

Browser
↓
ALB
↓
├── / → Next.js
└── /api/\* → Rails API
