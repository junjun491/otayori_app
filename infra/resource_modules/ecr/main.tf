resource "aws_ecr_repository" "this" {
  for_each = toset(var.repositories)

  name = each.value
  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(var.tags, {
    Name = each.value
  })
}
