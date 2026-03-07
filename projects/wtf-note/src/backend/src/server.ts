import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { categoryService } from "./services/category.service";

async function bootstrap() {
  try {
    // Initialize default categories
    await categoryService.initDefaults();
    logger.info("Default categories initialized");

    app.listen(env.PORT, () => {
      logger.info(`WTF-Note API running on port ${env.PORT}`, {
        env: env.NODE_ENV,
        cors: env.CORS_ORIGIN,
      });
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
}

bootstrap();
