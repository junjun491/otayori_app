module "rds" {
  source = "../../resource_modules/rds"

  name             = var.name
  vpc_id           = var.vpc_id
  subnet_ids       = var.subnet_ids
  tags             = var.tags
  instance_class   = var.instance_class
  allocated_storage = var.allocated_storage
}

# 上位層から参照したくなるであろう output を用意
output "endpoint" {
  description = "RDS 接続エンドポイント"
  value       = module.rds.endpoint
}

output "port" {
  description = "RDS ポート番号"
  value       = module.rds.port
}

output "database_name" {
  description = "アプリ用DB名"
  value       = module.rds.database_name
}

output "username" {
  description = "DBユーザー名"
  value       = module.rds.username
}

output "password" {
  description = "DBパスワード（sensitive）"
  value       = module.rds.password
  sensitive   = true
}

output "security_group_id" {
  description = "RDS 用 Security Group ID"
  value       = module.rds.security_group_id
}
