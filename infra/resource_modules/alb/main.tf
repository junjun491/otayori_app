# ALB 用 Security Group
resource "aws_security_group" "alb" {
  name        = "${var.name}-sg"
  description = "Security group for ${var.name}"
  vpc_id      = var.vpc_id

  # とりあえず HTTP 80 を全世界から許可（あとで WAF/CloudFront/HTTPS に寄せていく）
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # egress は全部許可（ALB → ECS など）
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.name}-sg"
  })
}

# ALB 本体
resource "aws_lb" "this" {
  name               = var.name
  load_balancer_type = "application"
  internal           = false

  security_groups = [aws_security_group.alb.id]
  subnets         = var.public_subnet_ids

  idle_timeout = 60

  tags = merge(var.tags, {
    Name = var.name
  })
}

# フロントエンド用 Target Group
resource "aws_lb_target_group" "frontend" {
  name_prefix = "otdfe-"  # ← 固定nameをやめる
  port        = var.frontend_port        # ← composition側で 3000 にする
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip" # Fargate用

  health_check {
    path                = "/api/healthz"
    protocol            = "HTTP"
    matcher             = "200-399"
    healthy_threshold   = 3
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(var.tags, {
    Name = "${var.name}-frontend-tg"
  })
}

# バックエンド用 Target Group
resource "aws_lb_target_group" "backend" {
  name_prefix = "otdbe-"  # ← 固定nameやめる
  port        = var.backend_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/healthz"
    protocol            = "HTTP"
    matcher             = "200-399"
    healthy_threshold   = 3
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(var.tags, {
    Name = "${var.name}-backend-tg"
  })
}

# HTTP リスナー（80番）
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  # デフォルトはフロントエンドへ
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# /api/* は backend へ振り分け
resource "aws_lb_listener_rule" "api_to_backend" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}
