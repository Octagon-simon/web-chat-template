import { spawn } from "node:child_process";
import { join } from "node:path";

const bin = process.platform === "win32" ? "vite.cmd" : "vite";

const children = [
  spawn(join("node_modules", ".bin", bin), [], { stdio: "inherit" }),
  spawn(process.execPath, ["server/index.mjs"], { stdio: "inherit" }),
];

const shutdown = () => {
  for (const child of children) child.kill();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
