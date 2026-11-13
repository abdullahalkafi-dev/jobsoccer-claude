import colors from "colors";
import mongoose from "mongoose";
import config from "./config";
import socketServer from "./socket/socketServer";
import { logger } from "./shared/logger/logger";
import { seedSuperAdmin } from "./shared/db/seedSuperAdmin";
import { startAiBackgroundWork } from "./shared/ai/aiWorker";
import { registerAiEvaluationListeners } from "./modules/aiEvaluation/aiEvaluation.listeners";
import { ProfileQualityService } from "./modules/profileQuality/profileQuality.service";
import { assertSafeEnvironment } from "./shared/safety/envGuard";
import { UPLOAD_REQUEST_TIMEOUT_MS } from "./modules/video/video.constant";

// Refuse to start a dev/staging process against the client's production database
try {
  assertSafeEnvironment();
} catch (error) {
  logger.error((error as Error).message);
  process.exit(1);
}

//uncaught exception
process.on("uncaughtException", (error) => {
  logger.error("UnhandledException Detected", error);
  process.exit(1);
});

const server = socketServer();
// Node closes any request that takes longer than 5 minutes by default (408). A 600 MB interview video
// on a normal home or phone connection needs much longer, so allow up to 45 minutes per request.
server.requestTimeout = UPLOAD_REQUEST_TIMEOUT_MS;

async function main() {
  try {
    mongoose.connect(config.database_url as string);
    logger.info(colors.green("🚀 Database connected successfully"));
    
    // Seed super admin on startup
    await seedSuperAdmin();

    // Events -> queues (a request only emits; workers do the slow part)
    registerAiEvaluationListeners();
    ProfileQualityService.registerListeners();

    // Background workers (interview assessments, captions, job matching, profile quality)
    await startAiBackgroundWork().catch((error) =>
      logger.error("AI worker could not start", { error: error.message })
    );
    ProfileQualityService.startStaleRecalculationSchedule();

    const port =
      typeof config.port === "number" ? config.port : Number(config.port);
    // await redisClient.connect();

    server.listen(port, "0.0.0.0", () => {
      logger.info(
        colors.yellow(
          `♻️  Application listening ${config.ip_address} on port:${config.port}`
        )
      );
    });
  } catch (error) {
    logger.error(colors.red("🤢 Failed to connect Database"));
  }
}

//handle unhandledRejection
process.on("unhandledRejection", (error) => {
  if (server) {
    server.close(() => {
      logger.error("UnhandledRejection Detected", error);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

main();

// Only handle SIGTERM in production environments
// In development, ts-node-dev handles restarts via SIGTERM
if (process.env.NODE_ENV === "production") {
  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, shutting down gracefully...");
    if (server) {
      server.close(async () => {
        logger.info("HTTP server closed.");
        //TODO: close other resources like redis
        // await redisClient.disconnect();
        await mongoose.connection.close();
        process.exit(0);
      });
    }
  });
}
