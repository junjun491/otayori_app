output "vpc_id" {
    description = "ID of the VPC"
    value = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = values(aws_subnet.public).*.id
  # または:
  # value = [for s in aws_subnet.public : s.value.id]
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = values(aws_subnet.private).*.id
  # または:
  # value = [for s in aws_subnet.private : s.value.id]
}