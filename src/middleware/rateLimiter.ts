import rateLimit from 'express-rate-limit';

export const apiKeyAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many authorization attempts, please try again later' }
});

export const apiKeyGenerateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 new keys per hour
  message: { error: 'Too many API key generation attempts, please try again later' }
}); 