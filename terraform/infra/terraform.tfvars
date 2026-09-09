aws_region   = "eu-north-1"
cluster_name = "bewerbungsmanager-eks"
environment  = "dev"

kubernetes_version = "1.34"

vpc_cidr = "10.0.0.0/16"

availability_zones = [
  "eu-north-1a",
  "eu-north-1b"
]

private_subnets = [
  "10.0.1.0/24",
  "10.0.2.0/24"
]

public_subnets = [
  "10.0.101.0/24",
  "10.0.102.0/24"
]

node_instance_types = [
  "t3.medium"
]

node_min_size     = 1
node_desired_size = 2
node_max_size     = 3