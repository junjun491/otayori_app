module "vpc" {
  source = "../../resource_modules/vpc"

  name       = var.name
  cidr_block = var.cidr_block
  az_count   = var.az_count

  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs

  enable_nat        = var.enable_nat
  nat_gateway_count = var.nat_gateway_count

  tags = var.tags
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}