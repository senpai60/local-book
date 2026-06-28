import app from "./src/app.js";
import { createServer } from "http";
import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";
import { logger } from "./src/config/logger.js";

const startServer = async () => {
  try {
    await connectDB();

    const server = createServer(app);

    server.listen(env.PORT, () => {
      logger.info(`Server is running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
    });

    process.on("unhandledRejection", (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
