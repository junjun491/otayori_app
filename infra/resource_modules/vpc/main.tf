# ======================================================
# 利用可能なアベイラビリティゾーン（AZ）を取得
# ======================================================
data "aws_availability_zones" "this" {
  state = "available"
}

locals {
  # 使用するAZ（例: 3つ）
  azs = slice(data.aws_availability_zones.this.names, 0, var.az_count)

  # NATを配置するAZ（コスト削減のため最初のAZに固定）
  nat_az_index = 0
}

# ======================================================
# VPC本体
# ======================================================
resource "aws_vpc" "this" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(var.tags, {
    Name = "${var.name}-vpc"
  })
}

# ======================================================
# インターネットゲートウェイ
# ======================================================
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.this.id
  tags   = merge(var.tags, { Name = "${var.name}-igw" })
}

# ======================================================
# Publicサブネット群（各AZに1つずつ）
# ======================================================
resource "aws_subnet" "public" {
  for_each          = { for idx, az in local.azs : idx => az }

  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnet_cidrs[tonumber(each.key)]
  availability_zone       = each.value
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${var.name}-public-${each.value}"
    Tier = "public"
  })
}

# Publicルートテーブル
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  tags   = merge(var.tags, { Name = "${var.name}-public-rt" })
}

# Publicルート（IGW経由で外部へ）
resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw.id
}

# Publicサブネットとルートテーブルの紐付け
resource "aws_route_table_association" "public_assoc" {
  for_each       = aws_subnet.public
  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}

# ======================================================
# NAT Gateway + EIP
# ======================================================
resource "aws_eip" "nat" {
  count      = var.enable_nat ? var.nat_gateway_count : 0
  domain     = "vpc"
  depends_on = [aws_internet_gateway.igw]

  tags = merge(var.tags, {
    Name = "${var.name}-nat-eip-${count.index}"
  })
}

resource "aws_nat_gateway" "this" {
  count         = var.enable_nat ? var.nat_gateway_count : 0
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = element(
    values(aws_subnet.public).*.id,
    count.index == 0 ? local.nat_az_index : count.index
  )

  tags = merge(var.tags, {
    Name = "${var.name}-nat-${count.index}"
  })
}

# ======================================================
# Privateサブネット群（各AZに1つずつ）
# ======================================================
resource "aws_subnet" "private" {
  for_each          = { for idx, az in local.azs : idx => az }
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_subnet_cidrs[tonumber(each.key)]
  availability_zone = each.value

  tags = merge(var.tags, {
    Name = "${var.name}-private-${each.value}"
    Tier = "private"
  })
}

# Privateルートテーブル（各AZごと）
resource "aws_route_table" "private" {
  for_each = aws_subnet.private
  vpc_id   = aws_vpc.this.id

  tags = merge(var.tags, {
    Name = "${var.name}-private-rt-${each.key}"
  })
}

# Privateルート（NAT経由で外部へ）
resource "aws_route" "private_egress" {
  for_each               = var.enable_nat ? aws_route_table.private : {}
  route_table_id         = each.value.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.this[0].id
  depends_on             = [aws_nat_gateway.this]
}

# Privateサブネットとルートテーブルの紐付け
resource "aws_route_table_association" "private_assoc" {
  for_each       = aws_subnet.private
  subnet_id      = each.value.id
  route_table_id = aws_route_table.private[each.key].id
}
