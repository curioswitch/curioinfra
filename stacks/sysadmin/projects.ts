import type { GoogleBetaProvider } from "@cdktf/provider-google-beta/lib/provider";
import { ProjectIamMember } from "@cdktf/provider-google/lib/project-iam-member/index.js";
import { ProjectService } from "@cdktf/provider-google/lib/project-service";
import { GcpProject } from "@curioswitch/cdktf-constructs";
import { Construct } from "constructs";

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
      projectId: "curioswitch-dev",
      organizationId: config.orgId,
      billingAccountId: config.billingAccount,
      githubInfraRepo: `${config.githubOrg}/curioinfra`,
      githubEnvironment: "dev",
      googleBeta: config.googleBeta,

      dependsOn: [iamCredentials],
    });

    new GcpProject(this, {
      projectId: "curioswitch-prod",
      organizationId: config.orgId,
      billingAccountId: config.billingAccount,
      githubInfraRepo: `${config.githubOrg}/curioinfra`,
      githubEnvironment: "prod",
      googleBeta: config.googleBeta,

      dependsOn: [iamCredentials],
    });

    const tasukeDev = new GcpProject(this, {
      projectId: "tasuke-dev",
      organizationId: config.orgId,
      billingAccountId: config.billingAccount,
      githubInfraRepo: `${config.githubOrg}/tasuke-infra`,
      githubEnvironment: "dev",
      googleBeta: config.googleBeta,

      dependsOn: [iamCredentials],
    });

    const tasukeProd = new GcpProject(this, {
      projectId: "tasuke-prod",
      organizationId: config.orgId,
      billingAccountId: config.billingAccount,
      githubInfraRepo: `${config.githubOrg}/tasuke-infra`,
      githubEnvironment: "prod",
      googleBeta: config.googleBeta,

      dependsOn: [iamCredentials],
    });

    // We read dev DNS nameservers from prod project for
    // setting up delegation.
    new ProjectIamMember(this, "tasuke-prod-viewer-dev-viewer", {
      project: tasukeDev.project.projectId,
      role: "roles/viewer",
      member: tasukeProd.terraformViewerServiceAccount.member,
    });
  }
}
