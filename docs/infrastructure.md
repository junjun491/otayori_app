# インフラ構成（AWS / Terraform）

本プロジェクトでは、Terraform により AWS インフラを構築しています。

## 構成概要

- VPC（Public / Private Subnet）
- ALB（Application Load Balancer）
- ECS Fargate（frontend / backend）
- RDS（PostgreSQL）
- ECR（Docker Image 管理）

## アーキテクチャ

```
flowchart LR
  U[User] -->|HTTPS| ALB
  ALB -->|/*| FE[Next.js]
  ALB -->|/api/*| BE[Rails API]
  BE --> DB[(RDS)]
```

## ポイント

### ALB（単一入口）

- すべての通信は ALB を経由
- パスベースルーティングで振り分け

| パス       | 転送先   |
| ---------- | -------- |
| `/*`       | Frontend |
| `/api/*`   | Backend  |
| `/healthz` | Backend  |

### ECS（Fargate）

- frontend / backend を分離
- ALB Target Group に紐付け
- Docker イメージは ECR から取得

### RDS

- Private Subnet に配置
- Backend からのみアクセス可能
- 外部公開なし

### Terraform設計

ディレクトリ構成：

- `bootstrap_remote_state`：S3 + DynamoDB
- `composition/dev-ecr`：ECR
- `composition/dev-iam`：OIDC IAM
- `composition/dev`：本体（VPC / ECS / ALB / RDS）

## 意識したこと

- 責務分離（Frontend / Backend / Infra）
- ALBを起点としたシンプルな構成
- Terraformによる再現性のある環境構築
