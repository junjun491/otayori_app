module "ecs" {
  source = "../../resource_modules/ecs"

  name_prefix        = var.name_prefix
  vpc_id             = var.vpc_id
  private_subnet_ids = var.private_subnet_ids

  alb_security_group_id = var.alb_security_group_id
  frontend_tg_arn       = var.frontend_tg_arn
  backend_tg_arn        = var.backend_tg_arn

  backend_image  = var.backend_image
  frontend_image = var.frontend_image

  database_url          = var.database_url
  rds_security_group_id = var.rds_security_group_id

  tags = var.tags

  rails_secret_key_base_secret_arn = var.rails_secret_key_base_secret_arn
}

output "cluster_name" {
  description = "ECS クラスタ名"
  value       = module.ecs.cluster_name
}

output "backend_service_name" {
  description = "バックエンド ECS サービス名"
  value       = module.ecs.backend_service_name
}

output "frontend_service_name" {
  description = "フロントエンド ECS サービス名"
  value       = module.ecs.frontend_service_name
}
