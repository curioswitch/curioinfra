import { DataGoogleDnsRecordSet } from "@cdktn/provider-google/lib/data-google-dns-record-set/index.js";
import { DnsManagedZone } from "@cdktn/provider-google/lib/dns-managed-zone/index.js";
import { DnsRecordSet } from "@cdktn/provider-google/lib/dns-record-set/index.js";
import { Construct } from "constructs";

export interface DnsZoneConfig {
  domain: string;
  delegateProject: string;
}

export class DnsZone extends Construct {
  constructor(scope: Construct, config: DnsZoneConfig) {
    super(scope, `${config.domain.replace(".", "-")}`);

    const zone = new DnsManagedZone(this, "zone", {
      name: config.domain.replace(".", "-"),
      dnsName: `${config.domain}.`,
      dnssecConfig: {
        kind: "dns#managedZoneDnsSecConfig",
        nonExistence: "nsec3",
        state: "on",
        defaultKeySpecs: [
          {
            algorithm: "rsasha256",
            keyLength: 2048,
            keyType: "keySigning",
            kind: "dns#dnsKeySpec",
          },
          {
            algorithm: "rsasha256",
            keyLength: 1024,
            keyType: "zoneSigning",
            kind: "dns#dnsKeySpec",
          },
        ],
      },
    });

    const delegateNameservers = new DataGoogleDnsRecordSet(
      this,
      "delegate-ns",
      {
        project: config.delegateProject,
        managedZone: zone.name,
        type: "NS",
        name: zone.dnsName,
      },
    );

    new DnsRecordSet(this, "ns", {
      managedZone: zone.name,
      name: zone.dnsName,
      type: "NS",
      ttl: 21600,
      rrdatas: delegateNameservers.rrdatas,
    });
  }
}
