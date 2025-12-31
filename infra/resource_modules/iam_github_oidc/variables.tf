variable "name_prefix" {
  description = "IAM ロール名などのプレフィックス"
  type        = string
}

variable "github_repository" {
  description = "GitHub リポジトリ (junjun491/otayori_app)"
  type        = string
}

variable "tags" {
  description = "共通タグ"
  type        = map(string)
}
