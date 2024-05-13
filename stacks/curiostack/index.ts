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

    new ServiceAccounts(this, {
      project: config.project,
    });

    new Identity(this, {
      project: config.project,
    });
  }
}
