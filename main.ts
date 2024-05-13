import { App } from "cdktf";
import { CurioStack } from "./stacks/curiostack";
import { SysadminStack } from "./stacks/sysadmin";

const app = new App();

new SysadminStack(app);

new CurioStack(app, {
  project: "curioswitch-dev",
  environment: "dev",
});

app.synth();
