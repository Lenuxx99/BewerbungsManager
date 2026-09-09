module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"

  name               = var.cluster_name
  kubernetes_version = var.kubernetes_version

  # EKS Control Plane Logging deaktivieren
  enabled_log_types           = []
  create_cloudwatch_log_group = false

  # Keinen eigenen KMS-Key erstellen
  create_kms_key    = false
  encryption_config = null

  # Netzwerk
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  endpoint_public_access  = true
  endpoint_private_access = true

  # Cluster IAM Role
  create_iam_role = false
  iam_role_arn    = aws_iam_role.eks_cluster.arn

  # OIDC Provider für IRSA
  enable_irsa = true

  # Terraform-Ausführer bekommt Cluster-Admin-Zugriff
  enable_cluster_creator_admin_permissions = true

  # EKS Add-ons
  addons = {
    coredns    = {}
    kube-proxy = {}
    vpc-cni = {
      service_account_role_arn = aws_iam_role.vpc_cni.arn
    }
  }

  # Managed Node Group
  eks_managed_node_groups = {
    main = {
      name = "bewerbungsmanager-nodes"

      subnet_ids = module.vpc.private_subnets

      instance_types = var.node_instance_types
      capacity_type  = "ON_DEMAND"

      min_size     = var.node_min_size
      max_size     = var.node_max_size
      desired_size = var.node_desired_size

      create_iam_role = false
      iam_role_arn    = aws_iam_role.eks_nodes.arn

      labels = {
        role = "general"
      }

      tags = local.common_tags
    }
  }

  tags = local.common_tags
}