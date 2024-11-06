import { GithubProvider } from "@cdktf/provider-github/lib/provider";
import { GoogleBetaProvider } from "@cdktf/provider-google-beta/lib/provider";
import { DataGoogleBillingAccount } from "@cdktf/provider-google/lib/data-google-billing-account";
import { DataGoogleOrganization } from "@cdktf/provider-google/lib/data-google-organization";
import { KmsCryptoKey } from "@cdktf/provider-google/lib/kms-crypto-key/index.js";
import { KmsKeyRing } from "@cdktf/provider-google/lib/kms-key-ring/index.js";
import { Project } from "@cdktf/provider-google/lib/project";
import { ProjectService } from "@cdktf/provider-google/lib/project-service";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { StorageBucket } from "@cdktf/provider-google/lib/storage-bucket";
import { GcsBackend, TerraformStack } from "cdktf";
import type { Construct } from "constructs";
import { Dns } from "./dns.js";
import { GcpProjects } from "./projects.js";
import { Repos } from "./repos.js";

const projectName = "curioswitch-sysadmin";
const stateBucket = "curioswitch-sysadmin-tfstate";

export class SysadminStack extends TerraformStack {
  constructor(scope: Construct) {
    super(scope, "sysadmin");

    new GcsBackend(this, {
      bucket: stateBucket,
    });

    new GithubProvider(this, "github", {
      owner: "curioswitch",
    });

    new GoogleProvider(this, "google", {
      project: projectName,
      region: "asia-northeast1",
    });

    const googleBeta = new GoogleBetaProvider(this, "google-beta", {
      project: projectName,
      region: "asia-northeast1",
    });

    const org = new DataGoogleOrganization(this, "curioswitch-org", {
      domain: "curioswitch.org",
    });

    const billing = new DataGoogleBillingAccount(this, "curioswitch-billing", {
      displayName: "curioswitch-billing",
    });

    const project = new Project(this, "sysadmin-project", {
      projectId: projectName,
      name: projectName,
      orgId: org.orgId,
      billingAccount: billing.id,
    });

    new ProjectService(this, "service-domains", {
      service: "domains.googleapis.com",
    });

    new ProjectService(this, "service-dns", {
      service: "dns.googleapis.com",
    });

    const kmsService = new ProjectService(this, "service-kms", {
      service: "cloudkms.googleapis.com",
    });

    const terraformKeyring = new KmsKeyRing(this, "terraform-keyring", {
      project: project.projectId,
      name: "terraform",
      location: "global",
      dependsOn: [kmsService],
    });

    const terraformSecretsKey = new KmsCryptoKey(this, "terraform-key", {
      keyRing: terraformKeyring.id,
      name: "secrets",
    });

    new StorageBucket(this, "tfstate", {
      name: stateBucket,
      location: "ASIA-NORTHEAST1",
      versioning: {
        enabled: true,
      },
    });

    new Dns(this);

    new GcpProjects(this, {
      orgId: org.orgId,
      billingAccount: billing.id,
      githubOrg: "curioswitch",
      googleBeta: googleBeta,
    });

    new Repos(this, {
      terraformSecretsKey,
    });
  }
}
