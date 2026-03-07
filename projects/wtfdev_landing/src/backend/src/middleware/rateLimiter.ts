import rateLimit from "express-rate-limit";

export const contactRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Rate limit exceeded",
    message: "Please wait before submitting another form",
    retry_after: 60,
  },
});

export const newsletterRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Rate limit exceeded",
    message: "Please wait before submitting another request",
    retry_after: 60,
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Rate limit exceeded",
    message: "Too many requests, please try again later",
    retry_after: 60,
  },
});
