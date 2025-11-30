variable "name" {}
variable "cidr_block" {}
variable "az_count" {}

variable "public_subnet_cidrs" {
  type = list(string)
}

variable "private_subnet_cidrs" {
  type = list(string)
}

variable "enable_nat" {
  type    = bool
  default = true
}

variable "nat_gateway_count" {
  type    = number
  default = 1
}

variable "tags" {
  type = map(string)
}
