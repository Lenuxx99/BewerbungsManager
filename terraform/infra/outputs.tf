output "cluster_name" {
  description = "Name des EKS Clusters"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "API Endpoint des EKS Clusters"
  value       = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  description = "CA Zertifikat des EKS Clusters"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "oidc_provider_arn" {
  description = "OIDC Provider ARN für IRSA"
  value       = module.eks.oidc_provider_arn
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "Private Subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnet_ids" {
  description = "Public Subnet IDs"
  value       = module.vpc.public_subnets
}

output "api_ecr_repository_url" {
  description = "ECR Repository URL der API"
  value       = aws_ecr_repository.api.repository_url
}

output "github_actions_role_arn" {
  description = "IAM Role ARN für GitHub Actions OIDC"
  value       = aws_iam_role.github_actions.arn
}