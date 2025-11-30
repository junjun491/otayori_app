module "alb" {
  source = "../../resource_modules/alb"

  name              = var.name
  vpc_id            = var.vpc_id
  public_subnet_ids = var.public_subnet_ids
  frontend_port     = var.frontend_port
  backend_port      = var.backend_port
  tags              = var.tags
}

output "alb_arn" {
  description = "ALB ARN"
  value       = module.alb.alb_arn
}

output "alb_dns_name" {
  description = "ALB の DNS 名"
  value       = module.alb.alb_dns_name
}

output "listener_arn" {
  description = "HTTP リスナーの ARN"
  value       = module.alb.listener_arn
}

output "target_group_arns" {
  description = "frontend/backend の Target Group ARN"
  value       = module.alb.target_group_arns
}

output "security_group_id" {
  description = "ALB 用 Security Group ID"
  value       = module.alb.security_group_id
}