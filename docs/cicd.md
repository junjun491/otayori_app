# CI/CD（GitHub Actions）

本プロジェクトでは GitHub Actions による CI/CD を構築しています。

## 構成

```
flowchart LR
Dev -->|push| GH[GitHub Actions]
GH -->|OIDC| IAM[AWS IAM Role]
GH -->|build| ECR
GH -->|run task| ECS
```

## CI（build & push）

- main ブランチ push で起動
- Docker イメージを build
- ECR に push

## CD（deploy）

backend に変更がある場合のみ実行：

1. ECS RunTask で migration 実行
2. 成功後 ECS Service を更新
3. 新しいタスクが ECR から最新イメージを取得

## ポイント

### OIDC 認証

- GitHub → AWS は OIDC で接続
- 長期クレデンシャル不使用

### migration戦略

- ECS Serviceとは分離
- one-off task で実行
- 失敗時は deploy しない

## 意識したこと

- 安全なデプロイ（migration → deploy）
- セキュアな認証（OIDC）
- 不要なデプロイを防止（backend変更のみ）
