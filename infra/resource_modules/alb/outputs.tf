output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.this.arn
}

output "alb_dns_name" {
  description = "ALB の DNS 名"
  value       = aws_lb.this.dns_name
}

output "listener_arn" {
  description = "HTTP リスナー ARN"
  value       = aws_lb_listener.http.arn
}

output "target_group_arns" {
  description = "frontend/backend Target Group ARNs"
  value = {
    frontend = aws_lb_target_group.frontend.arn
    backend  = aws_lb_target_group.backend.arn
  }
}

output "security_group_id" {
  description = "ALB 用 Security Group ID"
  value       = aws_security_group.alb.id
}
