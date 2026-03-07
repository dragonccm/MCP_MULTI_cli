import app from "./app.js";
import { config } from "./config/index.js";
import { testConnection, disconnect } from "./config/database.js";
import { migrate } from "./db/migrate.js";

async function main(): Promise<void> {
  try {
    await testConnection();
    console.info("Database connected successfully");

    await migrate();

    app.listen(config.port, "0.0.0.0", () => {
      console.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnect();
  process.exit(0);
});

main();
