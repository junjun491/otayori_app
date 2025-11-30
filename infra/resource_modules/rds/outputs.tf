output "endpoint" {
  description = "RDS 接続エンドポイント"
  value       = aws_db_instance.this.address
}

output "port" {
  description = "RDS ポート番号"
  value       = aws_db_instance.this.port
}

output "database_name" {
  description = "アプリ用DB名"
  value       = aws_db_instance.this.db_name
}

output "username" {
  description = "DBユーザー名"
  value       = aws_db_instance.this.username
}

output "password" {
  description = "DBパスワード"
  value       = random_password.master.result
  sensitive   = true
}

output "security_group_id" {
  description = "RDS 用 Security Group ID"
  value       = aws_security_group.this.id
}
