import { App } from "cdktf";
import { SysadminStack } from "./stacks/sysadmin";

const app = new App();
new SysadminStack(app);
app.synth();
