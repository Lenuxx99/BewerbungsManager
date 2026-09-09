terraform {
  backend "s3" {
    bucket       = "bewerbungsmanager-terraform-state-787107040006-eu-north-1-an"
    key          = "infra/terraform.tfstate"
    region       = "eu-north-1"
    use_lockfile = true
    encrypt      = true
  }
}