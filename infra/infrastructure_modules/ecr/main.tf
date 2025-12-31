module "ecr" {
  source = "../../resource_modules/ecr"

  repositories = var.repositories
  tags         = var.tags
}

output "repository_urls" {
  description = "ECR リポジトリ名ごとの URL"
  value       = module.ecr.repository_urls
}
