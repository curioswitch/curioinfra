import { GithubProvider } from "@cdktn/provider-github/lib/provider/index.js";
import { GoogleBetaProvider } from "@cdktn/provider-google-beta/lib/provider/index.js";
import { DataGoogleBillingAccount } from "@cdktn/provider-google/lib/data-google-billing-account/index.js";
import { DataGoogleOrganization } from "@cdktn/provider-google/lib/data-google-organization/index.js";
import { KmsCryptoKey } from "@cdktn/provider-google/lib/kms-crypto-key/index.js";
import { KmsKeyRing } from "@cdktn/provider-google/lib/kms-key-ring/index.js";
import { Project } from "@cdktn/provider-google/lib/project/index.js";
import { ProjectService } from "@cdktn/provider-google/lib/project-service/index.js";
import { GoogleProvider } from "@cdktn/provider-google/lib/provider/index.js";
import { StorageBucket } from "@cdktn/provider-google/lib/storage-bucket/index.js";
import { GcsBackend, TerraformStack } from "cdktn";
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
