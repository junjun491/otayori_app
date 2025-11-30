variable "name" {
  description = "ALB の名前プレフィックス"
  type        = string
}

variable "vpc_id" {
  description = "ALB を配置する VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "ALB を配置する Public Subnet IDs"
  type        = list(string)
}

variable "frontend_port" {
  description = "フロントエンド用 Target Group のポート"
  type        = number
  default     = 80
}

variable "backend_port" {
  description = "バックエンド用 Target Group のポート"
  type        = number
  default     = 3001
}

variable "tags" {
  description = "共通タグ"
  type        = map(string)
}
