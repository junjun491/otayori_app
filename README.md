# Otayori App（ポートフォリオ）

教師と生徒向けのお便り管理アプリ。  
Rails API + Next.js を AWS ECS/Fargate 上で運用し、Terraform による IaC と  
GitHub Actions による CI/CD を構築しています。

---

## 技術スタック

- Frontend: Next.js（App Router）
- Backend: Ruby on Rails（API）
- DB: PostgreSQL（RDS）
- Infra: AWS（ECS/Fargate, ALB, RDS, ECR）
- IaC: Terraform（S3 + DynamoDB による tfstate 管理）
- CI/CD: GitHub Actions（OIDC）

---

## アーキテクチャ

@@@
flowchart LR
U[User] -->|HTTPS| ALB[ALB]
ALB -->|/_| FE[ECS Fargate\nNext.js]
ALB -->|/api/_| BE[ECS Fargate\nRails API]
ALB -->|/healthz| BE
BE --> DB[(RDS PostgreSQL)]
@@@

---

## 特徴（アピールポイント）

- ALB を単一の公開入口として設計（Frontend / Backend の責務分離）
- Terraform による本番相当のインフラ構築（VPC / ECS / RDS / ALB）
- OIDC による GitHub Actions → AWS 認証（長期クレデンシャル不使用）
- ECS RunTask を用いた安全な DB migration 運用
- `/healthz` によるアプリケーションの死活監視

---

## デモ操作

- ログイン画面  
  http://localhost:3000/login

- 教師登録  
  http://localhost:3000/signup/teacher

---

## 詳細ドキュメント

詳細は以下に分離しています。

- インフラ構成: `docs/infrastructure.md`
- CI/CD: `docs/cicd.md`
- ローカル開発: `docs/setup.md`
- API通信設計: `docs/architecture.md`

---

## このポートフォリオで意識したこと

- 「作って終わり」ではなく、**運用を前提とした設計**
- フロント / バックエンド / インフラの責務分離
- Terraform + CI/CD による継続的な改善可能な仕組み
