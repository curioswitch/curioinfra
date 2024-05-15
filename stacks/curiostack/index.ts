import { ProjectIamMember } from "@cdktf/provider-google/lib/project-iam-member";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { GcsBackend, TerraformStack } from "cdktf";
import type { Construct } from "constructs";
import { Identity } from "./identity";
import { ServiceAccounts } from "./service-accounts";

export interface CurioStackConfig {
  project: string;
  environment: string;
}

export class CurioStack extends TerraformStack {
  constructor(scope: Construct, config: CurioStackConfig) {
    super(scope, config.environment);

    new GcsBackend(this, {
      bucket: `${config.project}-tfstate`,
    });

    new GoogleProvider(this, "google", {
      project: config.project,
      region: "asia-northeast1",
      userProjectOverride: true,
    });

    // Even owner permission does not allow creating impersonation tokens.
    new ProjectIamMember(this, "sysadmin-token-creator", {
      project: config.project,
      role: "roles/iam.serviceAccountTokenCreator",
      member: "group:sysadmin@curioswitch.org",
    });

    new ServiceAccounts(this, {
      project: config.project,
    });

    new Identity(this, {
      project: config.project,
    });
  }
}
