import type { GoogleBetaProvider } from "@cdktf/provider-google-beta/lib/provider";
import { ProjectService } from "@cdktf/provider-google/lib/project-service";
import { Construct } from "constructs";
import { GcpProject } from "../../constructs/gcp-project/index.js";

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
      name: "curioswitch-dev",
      orgId: config.orgId,
      billingAccount: config.billingAccount,
      githubOrg: config.githubOrg,
      infraRepo: "curioinfra",
      environment: "dev",
      googleBeta: config.googleBeta,

      dependsOn: [iamCredentials],
    });

    new GcpProject(this, {
      name: "curioswitch-prod",
      devProject: "curioswitch-dev",
      orgId: config.orgId,
      billingAccount: config.billingAccount,
      githubOrg: config.githubOrg,
      infraRepo: "curioinfra",
      environment: "prod",
      googleBeta: config.googleBeta,

      dependsOn: [iamCredentials],
    });

    new GcpProject(this, {
      name: "tasuke-dev",
      orgId: config.orgId,
      billingAccount: config.billingAccount,
      githubOrg: config.githubOrg,
      infraRepo: "tasukeinfra",
      environment: "dev",
      googleBeta: config.googleBeta,

      dependsOn: [iamCredentials],
    });

    new GcpProject(this, {
      name: "tasuke-prod",
      devProject: "tasuke-dev",
      orgId: config.orgId,
      billingAccount: config.billingAccount,
      githubOrg: config.githubOrg,
      infraRepo: "tasukeinfra",
      environment: "prod",
      googleBeta: config.googleBeta,

      dependsOn: [iamCredentials],
    });
  }
}
