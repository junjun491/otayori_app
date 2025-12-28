variable "name_prefix" {
  type        = string
  description = "IAM ロール名などのプレフィックス"
}

variable "github_repository" {
  type        = string
  description = "GitHub リポジトリ (owner/repo)"
}

variable "tags" {
  type        = map(string)
  description = "共通タグ"
}
