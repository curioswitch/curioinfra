import { App } from "cdktf";
import { CurioStack } from "./stacks/curiostack/index.js";
import { SysadminStack } from "./stacks/sysadmin/index.js";

const app = new App();

new SysadminStack(app);

new CurioStack(app, {
  project: "curioswitch-dev",
  environment: "dev",
});

app.synth();
