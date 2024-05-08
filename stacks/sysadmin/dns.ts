import { DnsManagedZone } from "@cdktf/provider-google/lib/dns-managed-zone";
import { DnsRecordSet } from "@cdktf/provider-google/lib/dns-record-set";
import { Construct } from "constructs";

export class Dns extends Construct {
  constructor(scope: Construct) {
    super(scope, "dns");

    new DnsManagedZone(this, "kawaii-map-com", {
      name: "kawaii-map-com",
      dnsName: "kawaii-map.com.",
    });

    const curioswitchOrg = new DnsManagedZone(this, "curioswitch-org-zone", {
      name: "curioswitch-org",
      dnsName: "curioswitch.org.",
    });

    new DnsRecordSet(this, "curioswitch-org", {
      managedZone: curioswitchOrg.name,
      name: "curioswitch.org.",
      type: "A",
      ttl: 300,
      rrdatas: ["199.36.158.100"],
    });

    new DnsRecordSet(this, "curioswitch-org-txt", {
      managedZone: curioswitchOrg.name,
      name: "curioswitch.org.",
      type: "TXT",
      ttl: 300,
      rrdatas: [
        '"google-site-verification=F1MEXE9dJl8B8ggcYK8-cD23Cnl70LyrGzzfUyqjYpg"',
        '"v=spf1 include:_spf.google.com ?all"',
        "hosting-site=curioswitch-prod",
      ],
    });

    new DnsRecordSet(this, "curioswitch-org-mx", {
      managedZone: curioswitchOrg.name,
      name: "curioswitch.org.",
      type: "MX",
      ttl: 3600,
      rrdatas: ["1 smtp.google.com."],
    });

    new DnsRecordSet(this, "developers-curioswitch-org", {
      managedZone: curioswitchOrg.name,
      name: "developers.curioswitch.org.",
      type: "CNAME",
      ttl: 300,
      rrdatas: ["curioswitch-developers.web.app."],
    });

    new DnsRecordSet(this, "heros-curioswitch-org", {
      managedZone: curioswitchOrg.name,
      name: "heros.curioswitch.org.",
      type: "A",
      ttl: 300,
      rrdatas: ["199.36.158.100"],
    });

    new DnsRecordSet(this, "google-_domainkey-curioswitch-org", {
      managedZone: curioswitchOrg.name,
      name: "google._domainkey.curioswitch.org.",
      type: "TXT",
      ttl: 3600,
      rrdatas: [
        '"v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCe13ONTkQz3NoTITiTasjfnvTjLRPEK2ltwRW2CrPHqV3J0q0l0Hi7XcDxZ1dHw5ZZaNbv8M3VRJv7hrR2kO/QIQwqbsmNyd0wXoRmauQRp/sJpJBb4aGqCXe/4DplsfsuIAG1UEMIigL/7X0dRnae/ZJfywsEs37bzOacDI1OqwIDAQAB"',
      ],
    });

    new DnsRecordSet(this, "vscode-marketplace", {
      managedZone: curioswitchOrg.name,
      name: "_visual-studio-marketplace-curioswitch.curioswitch.org.",
      type: "TXT",
      ttl: 3600,
      rrdatas: ["fc90e6aa-fe3f-4bd6-ac00-b840d589c7be"],
    });
  }
}
