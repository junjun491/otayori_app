variable "region" {
  type    = string
  default = "ap-northeast-1" # 東京
}

variable "bucket_name" {
  type        = string
  description = "リモートステート用S3バケット名（グローバル唯一）"
}

variable "lock_table_name" {
  type        = string
  description = "Terraformロック用DynamoDBテーブル名"
  default     = "terraform-lock"
}

variable "tags" {
  type = map(string)
  default = {
    Managed = "terraform"
    Scope   = "tfstate"
  }
}
