# 環境変数 / 外部サービス

本プロジェクトで使用する環境変数および外部サービスの設定についてまとめます。

## メール送信（SendGrid）

本アプリケーションでは、メール送信に SendGrid を利用しています。

### API Key の管理

- SendGrid の API Key は環境変数で管理します
- ローカル開発環境では `.env` ファイルを使用します
- 本番環境では Secrets Manager などで安全に注入します

```env
SENDGRID_API_KEY=xxxxxxxx
```

### メール送信の有効 / 無効切り替え

環境変数 `MAIL_REAL_SEND` により、メール送信の ON/OFF を制御します。

```env
MAIL_REAL_SEND=true
```

- `true` の場合のみ実際にメール送信を行う
- デフォルトは `false`（誤送信防止）
- 開発環境では送信しない運用

## GitHub Actions Secrets

GitHub Actions が AWS / ECS を操作するために、以下の Secrets を登録します。

### 登録場所

GitHub  
→ Repository  
→ Settings  
→ Secrets and variables  
→ Actions  
→ Repository secrets

### AWS_ROLE_ARN

- GitHub Actions が OIDC で AssumeRole する IAM Role の ARN
- `dev-iam` の `terraform output` で取得した値を設定

※ 初期構築時や IAM を作り直した場合は必ず更新が必要

### ECS_CLUSTER

- デプロイ対象となる ECS Cluster 名（または ARN）

### ECS_SERVICE_BACKEND

- デプロイ対象となる backend ECS Service 名（または ARN）

## 補足

- 機密情報（API Key 等）は GitHub に直接保存しない
- 本番環境では Secrets Manager 等による安全な管理を前提とする
- OIDC を使用することで、長期クレデンシャルを不要としている
