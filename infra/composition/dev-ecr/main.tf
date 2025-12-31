module "ecr" {
  source = "../../infrastructure_modules/ecr"

  repositories = [
    "otayori-frontend",
    "otayori-backend",
  ]

  tags = {
    Project     = "otayori"
    Environment = "dev"
  }
}
