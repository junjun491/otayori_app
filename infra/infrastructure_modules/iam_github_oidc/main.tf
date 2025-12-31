module "iam_github_oidc" {
  source = "../../resource_modules/iam_github_oidc"

  name_prefix       = var.name_prefix
  github_repository = var.github_repository
  tags              = var.tags
}

output "github_actions_role_arn" {
  description = "GitHub Actions 用 IAM ロールの ARN"
  value       = module.iam_github_oidc.role_arn
}
