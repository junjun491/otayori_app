output "cluster_name" {
  description = "ECS クラスタ名"
  value       = aws_ecs_cluster.this.name
}

output "backend_service_name" {
  description = "バックエンド ECS サービス名"
  value       = aws_ecs_service.backend.name
}

output "frontend_service_name" {
  description = "フロントエンド ECS サービス名"
  value       = aws_ecs_service.frontend.name
}

output "ecs_security_group_id" {
  description = "ECS タスク用 Security Group ID"
  value       = aws_security_group.ecs_tasks.id
}
