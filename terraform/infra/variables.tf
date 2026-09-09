variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "eu-north-1"
}

variable "cluster_name" {
  description = "Name des EKS Clusters"
  type        = string
  default     = "bewerbungsmanager-eks"
}

variable "vpc_cidr" {
  description = "CIDR der VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability Zones"
  type        = list(string)

  default = [
    "eu-north-1a",
    "eu-north-1b"
  ]
}

variable "private_subnets" {
  description = "Private Subnet CIDRs"
  type        = list(string)

  default = [
    "10.0.1.0/24",
    "10.0.2.0/24"
  ]
}

variable "public_subnets" {
  description = "Public Subnet CIDRs"
  type        = list(string)

  default = [
    "10.0.101.0/24",
    "10.0.102.0/24"
  ]
}

variable "kubernetes_version" {
  description = "Kubernetes Version des EKS Clusters"
  type        = string

  # Beispielwert.
  # Vor dem Apply solltest du prüfen,
  # welche EKS-Version aktuell in eu-north-1 unterstützt wird.
  default = "1.34"
}

variable "environment" {
  description = "Umgebung"
  type        = string
  default     = "dev"
}

variable "node_instance_types" {
  description = "EC2 Typ der EKS Worker Nodes"
  type        = list(string)

  default = [
    "t3.medium"
  ]
}

variable "node_min_size" {
  type    = number
  default = 1
}

variable "node_desired_size" {
  type    = number
  default = 2
}

variable "node_max_size" {
  type    = number
  default = 2
}