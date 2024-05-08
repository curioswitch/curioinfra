import { GoogleBetaProvider } from "@cdktf/provider-google-beta/lib/provider";
import { Construct } from "constructs";
import { GcpProject } from "../../constructs/gcp-project";

interface GcpProjectsConfig {
  orgId: string;
  billingAccount: string;
  googleBeta: GoogleBetaProvider;
}

export class GcpProjects extends Construct {
  constructor(scope: Construct, config: GcpProjectsConfig) {
    super(scope, "gcp-projects");

    new GcpProject(this, {
      name: "curioswitch-prod",
      orgId: config.orgId,
      billingAccount: config.billingAccount,
      googleBeta: config.googleBeta,
    });

    new GcpProject(this, {
      name: "tasuke-dev",
      orgId: config.orgId,
      billingAccount: config.billingAccount,
      googleBeta: config.googleBeta,
    });
  }
}
