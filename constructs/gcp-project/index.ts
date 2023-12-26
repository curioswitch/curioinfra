import { GoogleFirebaseProject } from "@cdktf/provider-google-beta/lib/google-firebase-project";
import { GoogleBetaProvider } from "@cdktf/provider-google-beta/lib/provider";
import { Project } from "@cdktf/provider-google/lib/project";
import { ProjectService } from "@cdktf/provider-google/lib/project-service";
import { StorageBucket } from "@cdktf/provider-google/lib/storage-bucket";
import { Construct } from "constructs";

interface GcpProjectConfig {
  orgId: string;
  billingAccount: string;
  name: string;
  googleBeta: GoogleBetaProvider;
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

    new ProjectService(this, "resourcemanager", {
      project: this.project.projectId,
      service: "cloudresourcemanager.googleapis.com",
    });
  }
}
