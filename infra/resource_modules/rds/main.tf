# ランダムパスワード生成（コードにベタ書きしないため）
resource "random_password" "master" {
  length  = 20
  special = false
}

# RDS 用 Security Group
resource "aws_security_group" "this" {
  name        = "${var.name}-sg"
  description = "Security group for ${var.name}"
  vpc_id      = var.vpc_id

  # ingress は後で ECS の SG からだけ許可する予定。
  # いったんここでは空（何も inbound を許可しない）

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

# DB Subnet Group（private subnet に配置）
resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-subnet-group"
  subnet_ids = var.subnet_ids

  tags = merge(var.tags, {
    Name = "${var.name}-subnet-group"
  })
}

# RDS PostgreSQL インスタンス
resource "aws_db_instance" "this" {
  identifier = var.name

  engine         = "postgres"
  engine_version = "16.11"

  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage
  storage_type      = "gp3"

  db_name  = "otayori"
  username = "otayori_app"
  password = random_password.master.result

  port = 5432

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.this.id]

  publicly_accessible = false
  multi_az            = false

  backup_retention_period = 0
  skip_final_snapshot     = true
  deletion_protection     = false

  apply_immediately = true

  tags = merge(var.tags, {
    Name = var.name
  })
}
