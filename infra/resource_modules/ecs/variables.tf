variable "name_prefix" {
  description = "ECS リソースの名前プレフィックス"
  type        = string
}

variable "vpc_id" {
  description = "ECS を配置する VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "ECS タスクを配置する private subnet IDs"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "ALB の Security Group ID"
  type        = string
}

variable "frontend_tg_arn" {
  description = "フロントエンド用 Target Group ARN"
  type        = string
}

variable "backend_tg_arn" {
  description = "バックエンド用 Target Group ARN"
  type        = string
}

variable "backend_image" {
  description = "バックエンド用コンテナイメージ (ECR URI)"
  type        = string
}

variable "frontend_image" {
  description = "フロントエンド用コンテナイメージ (ECR URI)"
  type        = string
}

variable "database_url" {
  description = "アプリから参照する DATABASE_URL"
  type        = string
}

variable "rds_security_group_id" {
  description = "RDS の Security Group ID (5432 を ECS から開けるため)"
  type        = string
}

variable "tags" {
  description = "共通タグ"
  type        = map(string)
}

variable "rails_secret_key_base_secret_arn" {
  type = string
}
