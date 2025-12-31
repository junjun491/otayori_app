variable "name_prefix" {
  type        = string
  description = "IAM ロール名などのプレフィックス"
}

variable "github_repository" {
  type        = string
  description = "GitHub リポジトリ (junjun491/otayori_app)"
}

variable "tags" {
  type        = map(string)
  description = "共通タグ"
}
