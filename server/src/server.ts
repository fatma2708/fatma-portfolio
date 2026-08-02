import { createApp } from "./app.js";
import { buildDependencies } from "./container.js";

async function start(): Promise<void> {
  const deps = await buildDependencies();
  const app = createApp(deps);

  const server = app.listen(deps.config.port, deps.config.host, () => {
    deps.logger.info(
      { port: deps.config.port, env: deps.config.env, version: deps.config.version },
      "F.A.I. server listening"
    );
  });

  const shutdown = (signal: string): void => {
    deps.logger.info({ signal }, "shutting down");
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch(error => {
  console.error("Fatal startup error", error);
  process.exit(1);
});
