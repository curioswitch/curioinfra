import { ActionsOrganizationSecret } from "@cdktf/provider-github/lib/actions-organization-secret/index.js";
import { DataGoogleKmsSecret } from "@cdktf/provider-google/lib/data-google-kms-secret/index.js";
import type { KmsCryptoKey } from "@cdktf/provider-google/lib/kms-crypto-key/index.js";
import { Construct } from "constructs";

export interface ReposConfig {
  terraformSecretsKey: KmsCryptoKey;
}

export class Repos extends Construct {
  constructor(scope: Construct, config: ReposConfig) {
    super(scope, "repos");

    const curioswitchAppKey = new DataGoogleKmsSecret(
      this,
      "curioswitch-app-key",
      {
        cryptoKey: config.terraformSecretsKey.id,
        ciphertext:
          "CiQAAGLhZYN7wmdrLTx9udY59Rj8RYYb/v5+FwiEl1+He5eGRVYStQ0AP2ed7zf/+crKKr4EWmwQpIPG1RoeGvW4aLHruL1TRvhTP52qvwrgZ7N0DWP+AesizlaQCh12aZYg9V05jIzHzrswC+76SkTUol+WQBxdAU2FjzsSEc0EkX54EDujuT+Bg8J/tgD2A43dnIUXT3+BctTrccw8TGocLHkCTlevzWfI7gs4XyGMmFCWAt9RYu1zebaMwkOBIlLQtpM04Ch3vCMEzpGF19N+2RJMJm9R27ybha3SWyxAWkhLXPVUlpJb/Zx+dfSfo3T0QVERA34h0G/OiVB3NU9WKb/qH4/yiQxsC/mYlldCg9Xx6P3YorI7rL4zNcrjoMydD7Ghy0OsKaWdvnd4hTula2DTWvOrqs1RSVC6K2qWktvQWUFgZSQ+V9cKxlEC+jSTof7Kok/AIwfoa3w4MPYIBd5bl2mlXh/IyXjjtIlt9tlQWQQVFzdahIb0GzzQAqWE6Bkrl5HU7vxGetHu7xHti1ecjMl9R/+P+V80h4oSbZqY4afyMKg2BD0zLKZFTLGBfTv/pNDKmlBxunKygVOqryRQqgOdL/gk9wPGDDo/3fmN9ClZWW9H4ujYJimZJXhA3A/Sh/+Tn+zz36rhzH9ltIk24aXp3bZbivJRooRHlbi0fI4Uanmnx3bqTskIk+U+7ko5gkhNljzM+ldTvs6JI8VGkmHUa1sr95qdilGZDWKnh1M6Hi0VHbTEH7PB12uaRCbZYqWLLhFo8NCd5Vg7KIOdNkrsmc7i+8aXGXlZynStE7KiSqsv8I+SxwhesKiFQwu02T4kUGs6xPgBZzCsQttUfKhzolNLrL9UBSxMOa4WXR+rAcM218cvhQdol2uey0mm5cYSK9eIzAsiEOazlywRFPjTFL+dVFlt9SoN3jtifLQDiRBY0656dA3hIyP8PRffzhuvgYP2DEPCK0OISDiovKnuJH+SCv0RfRYoTP0AuWvdG19fjGLqr9rPTaTJ4mw1uO326jATT+BQKL3SbJqFQejTix5UfTGBkXjl0mRFq6I0Oj2utSh+d96gmqsiuW6dmdHQmjzspLwxnXkDxO8jNN13QP8GtfWsPUqUHkQI4HCpvobljpkVqMcWpmBuHbBu+iIFugCY/CMixQwxb/UV0Ynf+lbR8P58QAJ26cCG7r5vhU/IU57BURGagZSV8PKPgIo5yWoOzAOhAxaaCAkTicBEprMypQHuPwo2ywzQoZ5T7F6VFpUNMKvET2H35cgB7s5VioIsktzhM12B8RvLVQGP2FjiqZG4mRa81RNs5m0ENRzFkmu21M6urvF0lSYNjpXuR+T1eSMC7CJANv5UGPoIHRRniOngD5rWecQSCe/RH9wQjUWUQOZCJEEwgF+MXAIHijeg4A4eM35CyArskndE7eq/iV6UYgtcBqN0Tw+AQiOyAguW8XPxGFLZHFJVWVyJVDvWTP/iRaojsTCuhIVdpwmF9sqcSAM7YfhY7Si4LZ/ayOnwO9WFcLUDwAcl3PXX/KZ6ZbwBp/O5wyZoKEYzgNqQ37jj4gTJ85AZhd2kFh9xL0A64ToghtQzJy6GctjQGo3qOsXrH9VmvIMDJWhjD3yUV42l7ZfQWilRZWwRiDQNcrGU2YKP1eQx3Nw4ep4UHykG0g56v9UMsm2At+LaOpgMjPzv9g5wY+kLnd2VL8TaNtl71R+gvRgXfvVMRcZQLXYsaAeMuAWk//dbJj0RilIkKU9p0IJk4NkH3bvMcgvKaskupLpxU855m5xW6Kf1JFwd3raqwITKrRjdLXxzeJhFcgqruxysWw+aftgxJNybiqw+W3N/4KiUb5ncdaUnoCyGGK64jO2O01XS5lTUcqsKL7N/EuheasURLEt4OEh0L9R17b/SS7lWBykRobBp/ZO9PMSKUT89ELnAz/Q4i4Fxf/sFwwiYFdI331VslhYofT+l1ApLAhp3NyNXcYOIjYnbI29vN7pHiU+MYC+D9lvFreA3upzLGSAmDk935THz4O8zoK+v61VMy3a8LS2xeNhkjORXuhRCtslVYoviU606gr6+7ew4pIskBLfCiK/AUEdpWcrWzvh2U+Q9LkzL1xxAsM6EFIajegoODRy7e5MYKOCry07qlkUnfUmRVi1vXKnBBKeanleprbajgtgqr0Dz7gjY0FbhRY8IpBxgFaqN772sUTozCeyY5B3LaUUOtgUDgWU1zPDCZYZLHNNadibFsVX38TRe4zl4VvKE7lV/KxDv2UeTJlyLHfowekKLJs9jtwQfdnR192548w5eNqchMXD5PO4cofRaL3pY9FAXgnTB",
      },
    );

    new ActionsOrganizationSecret(this, "curioswitch-app-key-secret", {
      secretName: "CURIOSWITCH_APP_KEY",
      plaintextValue: curioswitchAppKey.plaintext,
      visibility: "all",
    });
  }
}
