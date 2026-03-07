import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/index.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { generalRateLimiter } from "./middleware/rateLimiter.js";

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  })
);

// Rate limiting
app.use("/api", generalRateLimiter);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: "The requested endpoint does not exist",
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
