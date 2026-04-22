import { IdentityPlatformConfig } from "@cdktn/provider-google/lib/identity-platform-config/index.js";
import { IdentityPlatformTenant } from "@cdktn/provider-google/lib/identity-platform-tenant/index.js";
import { ProjectService } from "@cdktn/provider-google/lib/project-service/index.js";
import { Construct } from "constructs";

export interface IdentityConfig {
  project: string;
}

export class Identity extends Construct {
  constructor(scope: Construct, config: IdentityConfig) {
    super(scope, "identity");

    const service = new ProjectService(this, "identitytoolkit", {
      service: "identitytoolkit.googleapis.com",
    });

    new ProjectService(this, "iamcredentials", {
      service: "iamcredentials.googleapis.com",
    });

    const identityPlatform = new IdentityPlatformConfig(
      this,
      "identity-platform",
      {
        signIn: {
          email: {
            enabled: true,
          },
        },
        authorizedDomains: [
          "localhost",
          `${config.project}.web.app`,
          `${config.project}.firebaseapp.com`,
        ],
        multiTenant: {
          allowTenants: true,
        },
        dependsOn: [service],
      },
    );

    new IdentityPlatformTenant(this, "tenant-e2e-test", {
      displayName: "e2e-test",

      allowPasswordSignup: true,

      dependsOn: [identityPlatform],
    });
  }
}
