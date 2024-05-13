import { IdentityPlatformConfig } from "@cdktf/provider-google/lib/identity-platform-config";
import { IdentityPlatformTenant } from "@cdktf/provider-google/lib/identity-platform-tenant";
import { ProjectService } from "@cdktf/provider-google/lib/project-service";
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
