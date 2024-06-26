import { GoogleFirebaseProject } from "@cdktf/provider-google-beta/lib/google-firebase-project";
import type { GoogleBetaProvider } from "@cdktf/provider-google-beta/lib/provider";
import { IamWorkloadIdentityPool } from "@cdktf/provider-google/lib/iam-workload-identity-pool";
import { IamWorkloadIdentityPoolProvider } from "@cdktf/provider-google/lib/iam-workload-identity-pool-provider";
import { KmsCryptoKey } from "@cdktf/provider-google/lib/kms-crypto-key";
import { KmsKeyRing } from "@cdktf/provider-google/lib/kms-key-ring";
import { Project } from "@cdktf/provider-google/lib/project";
import { ProjectService } from "@cdktf/provider-google/lib/project-service";
import { StorageBucket } from "@cdktf/provider-google/lib/storage-bucket";
import { type ITerraformDependable, TerraformOutput } from "cdktf";
import { Construct } from "constructs";

interface GcpProjectConfig {
  orgId: string;
  billingAccount: string;
  name: string;
  googleBeta: GoogleBetaProvider;
  githubOrg: string;

  dependsOn?: ITerraformDependable[];
}

export class GcpProject extends Construct {
  public readonly project: Project;

  constructor(scope: Construct, config: GcpProjectConfig) {
    super(scope, config.name);

    this.project = new Project(this, "this", {
      projectId: config.name,
      name: config.name,
      orgId: config.orgId,
      billingAccount: config.billingAccount,
      labels: {
        firebase: "enabled",
      },
      dependsOn: config.dependsOn,
    });

    new GoogleFirebaseProject(this, "firebase", {
      project: this.project.projectId,
      provider: config.googleBeta,
    });

    new StorageBucket(this, "tfstate", {
      project: this.project.projectId,
      name: `${this.project.projectId}-tfstate`,
      location: "US",
      storageClass: "STANDARD",
      versioning: {
        enabled: true,
      },
    });

    const iam = new ProjectService(this, "iam", {
      project: this.project.projectId,
      service: "iam.googleapis.com",
    });

    new ProjectService(this, "resourcemanager", {
      project: this.project.projectId,
      service: "cloudresourcemanager.googleapis.com",
    });

    // TODO: Dependencies seem fine but there seems to be a lag between project creation
    // and being able to create this. Executing apply twice for each project currently
    // is the workaround.
    const idPool = new IamWorkloadIdentityPool(this, "github-pool", {
      project: this.project.projectId,
      workloadIdentityPoolId: "github",
      dependsOn: [iam],
    });

    const idProvider = new IamWorkloadIdentityPoolProvider(
      this,
      "curioswitch-provider",
      {
        project: this.project.projectId,
        workloadIdentityPoolProviderId: "curioswitch",
        workloadIdentityPoolId: idPool.workloadIdentityPoolId,
        attributeMapping: {
          "google.subject": "assertion.sub",
          "attribute.actor": "assertion.actor",
          "attribute.repository": "assertion.repository",
          "attribute.repository_owner": "assertion.repository_owner",
        },
        attributeCondition: `assertion.repository_owner == '${config.githubOrg}'`,
        oidc: {
          issuerUri: "https://token.actions.githubusercontent.com",
        },
      },
    );

    new TerraformOutput(this, "github-identity-provider", {
      value: idProvider.name,
    });

    const kmsService = new ProjectService(this, "kms-service", {
      project: this.project.projectId,
      service: "cloudkms.googleapis.com",
    });

    const keyring = new KmsKeyRing(this, "terraform-keyring", {
      project: this.project.projectId,
      name: "terraform",
      location: "global",
      dependsOn: [kmsService],
    });

    new KmsCryptoKey(this, "terraform-key", {
      keyRing: keyring.id,
      name: "secrets",
    });
  }
}
