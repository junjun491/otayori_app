variable "name_prefix" {
  description = "IAM ロール名などのプレフィックス"
  type        = string
}

variable "github_repository" {
  description = "GitHub リポジトリ (owner/repo)"
  type        = string
}

variable "tags" {
  description = "共通タグ"
  type        = map(string)
}
