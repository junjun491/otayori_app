terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
}

provider "aws" {
  region = var.region
  profile = "terraform-admin"
}

# --- S3 bucket for remote state ---
resource "aws_s3_bucket" "tfstate" {
  bucket = var.bucket_name

  #検証に便利なので追加
  force_destroy = true
  # 誤削除防止（destroyを拒否）
  #lifecycle {
  #  prevent_destroy = true
  #}

  tags = var.tags
}

# 所有権の明確化（推奨）
resource "aws_s3_bucket_ownership_controls" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# パブリックアクセスを全面ブロック（必須）
resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket                  = aws_s3_bucket.tfstate.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# バージョニング有効（推奨）
resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  versioning_configuration { status = "Enabled" }
}

# サーバーサイド暗号化（SSE-S3）
resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# --- DynamoDB table for state lock ---
resource "aws_dynamodb_table" "lock" {
  name         = var.lock_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  # 誤削除防止
  #lifecycle {
  #  prevent_destroy = true
  #}

  tags = var.tags
}

output "bucket"     { value = aws_s3_bucket.tfstate.bucket }
output "lock_table" { value = aws_dynamodb_table.lock.name }
