variable "name" {
  description = "DBリソースの名前プレフィックス"
  type        = string
}

variable "vpc_id" {
  description = "RDS を配置する VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "RDS を配置する private subnet の ID リスト"
  type        = list(string)
}

variable "tags" {
  description = "共通タグ"
  type        = map(string)
}

variable "instance_class" {
  description = "DBインスタンスクラス"
  type        = string
}

variable "allocated_storage" {
  description = "ストレージサイズ(GB)"
  type        = number
}
