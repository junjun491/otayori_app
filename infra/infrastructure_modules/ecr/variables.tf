variable "repositories" {
  description = "ECR に作成するリポジトリ名一覧"
  type        = list(string)
}

variable "tags" {
  description = "共通タグ"
  type        = map(string)
}
