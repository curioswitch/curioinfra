import { ProjectIamMember } from "@cdktn/provider-google/lib/project-iam-member/index.js";
import { ServiceAccount } from "@cdktn/provider-google/lib/service-account/index.js";
import { Construct } from "constructs";

export interface ServiceAccountsConfig {
  project: string;
}

export class ServiceAccounts extends Construct {
  constructor(scope: Construct, config: ServiceAccountsConfig) {
    super(scope, "service-accounts");

    const itServiceAccount = new ServiceAccount(this, "integration-test", {
      accountId: "integration-test",
    });

    // For issuing Firebase custom tokens in tests.
    new ProjectIamMember(this, "integration-test-token-creator", {
      project: config.project,
      role: "roles/iam.serviceAccountTokenCreator",
      member: itServiceAccount.member,
    });
  }
}
