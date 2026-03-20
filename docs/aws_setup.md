# AWS セットアップ（dev 環境）

本プロジェクトの dev 環境は、Terraform により構築した  
ECS(Fargate) + ALB 構成上で起動します。

## Terraform 構成

本プロジェクトでは Terraform のスタックを以下のように分離しています。

```text
bootstrap_remote_state : Terraform Remote State（S3 / DynamoDB）
composition/dev-ecr    : ECR（frontend / backend）
composition/dev-iam    : GitHub Actions 用 IAM（OIDC）
composition/dev        : アプリ本体（VPC / ALB / ECS / RDS）
```

## 構築順序（重要）

それぞれ独立した Terraform スタックのため、  
各ディレクトリごとに `terraform init` が必要です。

また、`composition/dev` では ECR を data 参照しているため、  
以下の順序で構築します。

1. Remote State
2. ECR
3. IAM
4. dev 本体

## Step 1. Remote State 構築

Terraform の state 管理用に S3 + DynamoDB を作成します。

```bash
cd infra/bootstrap_remote_state
terraform init
terraform apply
```

## Step 2. ECR 構築

frontend / backend 用の ECR リポジトリを作成します。

```bash
cd infra/composition/dev-ecr
terraform init
terraform apply
```

作成確認：

```bash
aws ecr describe-repositories \
  --query 'repositories[*].repositoryName'
```

## Step 3. IAM（OIDC）構築

GitHub Actions が AWS にアクセスするための IAM Role を作成します。

```bash
cd infra/composition/dev-iam
terraform init
terraform apply
terraform output
```

※ 出力される Role ARN は GitHub Secrets に設定します

## Step 4. dev 本体 init

ECR / IAM 作成後に dev 本体スタックを初期化します。

```bash
cd infra/composition/dev
terraform init -reconfigure
terraform plan
```

## Step 5. dev 本体構築

AWS リソース（VPC / ALB / ECS / RDS）を作成します。

```bash
terraform apply
```

## 作成されるリソース

- ALB DNS 名（アクセス先 URL）
- ECS Cluster / Service（backend）

## 注意点

- Terraform apply 直後は ECS タスク起動と  
  ALB health check 完了まで一時的に 503 が返る場合があります
- 数十秒〜数分で解消されます
