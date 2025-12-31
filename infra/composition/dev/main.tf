module "network" {
  source = "../../infrastructure_modules/network"

  name       = "otayori-dev"
  cidr_block = "10.0.0.0/16"
  az_count   = 3

  public_subnet_cidrs  = ["10.0.0.0/20", "10.0.16.0/20", "10.0.32.0/20"]
  private_subnet_cidrs = ["10.0.128.0/20", "10.0.144.0/20", "10.0.160.0/20"]

  enable_nat        = true
  nat_gateway_count = 1

  tags = {
    Environment = "dev"
    Project     = "otayori"
  }
}

module "ecr" {
  source = "../../infrastructure_modules/ecr"

  # この環境で使うリポジトリ名を列挙
  repositories = [
    "otayori-backend",
    "otayori-frontend",
  ]

  tags = {
    Environment = "dev"
    Project     = "otayori"
  }
}

module "database" {
  source = "../../infrastructure_modules/database"

  name = "otayori-dev-db"

  vpc_id     = module.network.vpc_id
  subnet_ids = module.network.private_subnet_ids

  tags = {
    Environment = "dev"
    Project     = "otayori"
  }
}

module "alb" {
  source = "../../infrastructure_modules/alb"

  name = "otayori-dev-alb"

  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids

  frontend_port = 80      # 後で ECS と合わせる
  backend_port  = 3001    # Rails API の想定ポート（あとで調整OK）

  tags = {
    Environment = "dev"
    Project     = "otayori"
  }
}

module "ecs" {
  source = "../../infrastructure_modules/ecs"

  name_prefix        = "otayori-dev"
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids

  alb_security_group_id = module.alb.security_group_id
  frontend_tg_arn       = module.alb.target_group_arns["frontend"]
  backend_tg_arn        = module.alb.target_group_arns["backend"]

  backend_image = "${module.ecr.repository_urls["otayori-backend"]}:latest"
  frontend_image = "${module.ecr.repository_urls["otayori-frontend"]}:latest"

  # DB 接続URLをここで組み立てて渡す
  database_url = format(
    "postgres://%s:%s@%s:%d/%s",
    module.database.username,
    module.database.password,
    module.database.endpoint,
    module.database.port,
    module.database.database_name,
  )

  rds_security_group_id = module.database.security_group_id

  tags = {
    Environment = "dev"
    Project     = "otayori"
  }
}

module "iam_github_oidc" {
  source = "../../infrastructure_modules/iam_github_oidc"

  name_prefix       = "otayori-dev"
  github_repository = "junjun491/otayori_app:ref:refs/heads/main" # ← ここを自分の GitHub リポジトリに変更 (例: "nakaseatsushi/otayori-app")

  tags = {
    Environment = "dev"
    Project     = "otayori"
  }
}
