import { GoogleFirebaseProject } from "@cdktf/provider-google-beta/lib/google-firebase-project";
import type { GoogleBetaProvider } from "@cdktf/provider-google-beta/lib/provider";
import { IamWorkloadIdentityPool } from "@cdktf/provider-google/lib/iam-workload-identity-pool";
import { IamWorkloadIdentityPoolProvider } from "@cdktf/provider-google/lib/iam-workload-identity-pool-provider";
import { KmsCryptoKey } from "@cdktf/provider-google/lib/kms-crypto-key";
import { KmsCryptoKeyIamMember } from "@cdktf/provider-google/lib/kms-crypto-key-iam-member";
import { KmsKeyRing } from "@cdktf/provider-google/lib/kms-key-ring";
import { Project } from "@cdktf/provider-google/lib/project";
import { ProjectIamMember } from "@cdktf/provider-google/lib/project-iam-member";
import { ProjectService } from "@cdktf/provider-google/lib/project-service";
import { ServiceAccount } from "@cdktf/provider-google/lib/service-account";
import { ServiceAccountIamMember } from "@cdktf/provider-google/lib/service-account-iam-member";
import { StorageBucket } from "@cdktf/provider-google/lib/storage-bucket";
import { StorageBucketIamMember } from "@cdktf/provider-google/lib/storage-bucket-iam-member";
import { type ITerraformDependable, TerraformOutput } from "cdktf";
import { Construct } from "constructs";

interface GcpProjectConfig {
  orgId: string;
  billingAccount: string;
  name: string;
  googleBeta: GoogleBetaProvider;
  githubOrg: string;
  infraRepo: string;
  environment: string;
  devProject?: string;

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

    const tfState = new StorageBucket(this, "tfstate", {
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

    const terraformKey = new KmsCryptoKey(this, "terraform-key", {
      keyRing: keyring.id,
      name: "secrets",
    });

    const terraformAdmin = new ServiceAccount(this, "terraform-admin", {
      project: this.project.projectId,
      accountId: "terraform-admin",
    });

    new ProjectIamMember(this, "terraform-admin-owner", {
      project: this.project.projectId,
      role: "roles/owner",
      member: terraformAdmin.member,
    });

    new ServiceAccountIamMember(this, "terraform-admin-github-actions", {
      serviceAccountId: terraformAdmin.name,
      role: "roles/iam.serviceAccountTokenCreator",
      member: `principal://iam.googleapis.com/${idPool.name}/subject/repo:${config.githubOrg}/${config.infraRepo}:environment:${config.environment}`,
    });

    const terraformViewer = new ServiceAccount(this, "terraform-viewer", {
      project: this.project.projectId,
      accountId: "terraform-viewer",
    });

    new ProjectIamMember(this, "terraform-viewer-viewer", {
      project: this.project.projectId,
      role: "roles/viewer",
      member: terraformViewer.member,
    });

    // It's expected to view certain dev resources from prod, for example for delegating DNS.
    // Prod is a stricter project, so it is fine to provide viewer access to everything in dev
    // from it.
    if (config.devProject) {
      new ProjectIamMember(this, "terraform-viewer-viewer-dev", {
        project: config.devProject,
        role: "roles/viewer",
        member: terraformViewer.member,
      });
    }

    new ProjectIamMember(this, "terraform-viewer-serviceUser", {
      project: this.project.projectId,
      role: "roles/serviceusage.serviceUsageConsumer",
      member: terraformViewer.member,
    });

    new KmsCryptoKeyIamMember(this, "terraform-viewer-key-decrypter", {
      cryptoKeyId: terraformKey.id,
      role: "roles/cloudkms.cryptoOperator",
      member: terraformViewer.member,
    });

    new ProjectIamMember(this, "terraform-viewer-key-secretaccess", {
      project: this.project.projectId,
      role: "roles/secretmanager.secretAccessor",
      member: terraformViewer.member,
    });

    new ServiceAccountIamMember(this, "terraform-viewer-github-actions", {
      serviceAccountId: terraformViewer.name,
      role: "roles/iam.serviceAccountTokenCreator",
      member: `principal://iam.googleapis.com/${idPool.name}/subject/repo:${config.githubOrg}/${config.infraRepo}:environment:${config.environment}-viewer`,
    });

    // Need write permission to the state to take lock. While ideally we may use a different bucket, but
    // there is no such option. Generally we use permissions to protect against access to the infrastructure
    // itself and not the state so this is probably acceptable.
    new StorageBucketIamMember(this, "terraform-viewer-tfstate", {
      bucket: tfState.name,
      role: "roles/storage.objectUser",
      member: terraformViewer.member,
    });
  }
}
