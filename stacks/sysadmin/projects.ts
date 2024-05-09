import type { GoogleBetaProvider } from "@cdktf/provider-google-beta/lib/provider";
import { ProjectService } from "@cdktf/provider-google/lib/project-service";
import { Construct } from "constructs";
import { GcpProject } from "../../constructs/gcp-project";

interface GcpProjectsConfig {
  orgId: string;
  billingAccount: string;
  githubOrg: string;
  googleBeta: GoogleBetaProvider;
}

export class GcpProjects extends Construct {
  constructor(scope: Construct, config: GcpProjectsConfig) {
    super(scope, "gcp-projects");

    const iamCredentials = new ProjectService(this, "iamcredentials", {
      service: "iamcredentials.googleapis.com",
    });

    new GcpProject(this, {
      name: "curioswitch-prod",
      orgId: config.orgId,
      billingAccount: config.billingAccount,
      githubOrg: config.githubOrg,
      googleBeta: config.googleBeta,

      dependsOn: [iamCredentials],
    });

    new GcpProject(this, {
      name: "tasuke-dev",
      orgId: config.orgId,
      billingAccount: config.billingAccount,
      githubOrg: config.githubOrg,
      googleBeta: config.googleBeta,

      dependsOn: [iamCredentials],
    });
  }
}
