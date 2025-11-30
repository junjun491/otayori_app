terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
  backend "s3" {
    bucket         = "otayori-tfstate-nakase"  # ← さっきのOutputsのbucketに合わせる
    key            = "dev/terraform.tfstate"                # 環境ごとにキーを分ける
    region         = "ap-northeast-1"
    dynamodb_table = "terraform-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = "ap-northeast-1"
}
