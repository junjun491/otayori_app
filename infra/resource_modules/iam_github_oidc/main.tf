# GitHub Actions 用 OIDC Provider
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com",
  ]

  # GitHub Actions OIDC の固定 thumbprint（2025時点）
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
  ]
}

# AssumeRoleWithWebIdentity 用のポリシー
data "aws_iam_policy_document" "github_oidc_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # このロールを使える GitHub リポジトリとブランチを制限
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        # 例: repo:nakaseatsushi/otayori-app:ref:refs/heads/main
        "repo:${var.github_repository}:ref:refs/heads/main",
      ]
    }
  }
}

# GitHub Actions 用 IAM ロール
resource "aws_iam_role" "github_actions" {
  name               = "${var.name_prefix}-github-actions-role"
  assume_role_policy = data.aws_iam_policy_document.github_oidc_assume_role.json

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-github-actions-role"
  })
}

# とりあえずポートフォリオ用途なので広めの権限（本番運用なら絞る）
resource "aws_iam_role_policy_attachment" "github_actions_admin" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

output "role_arn" {
  description = "GitHub Actions が Assume する IAM Role の ARN"
  value       = aws_iam_role.github_actions.arn
}

output "oidc_provider_arn" {
  description = "GitHub OIDC Provider ARN"
  value       = aws_iam_openid_connect_provider.github.arn
}
