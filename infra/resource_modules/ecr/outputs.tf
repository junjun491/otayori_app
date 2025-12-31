output "repository_urls" {
  description = "ECR リポジトリ名ごとの URL (name → repository_url)"
  value = {
    for name, repo in aws_ecr_repository.this :
    name => repo.repository_url
  }
}
