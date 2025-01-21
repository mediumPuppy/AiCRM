import rateLimit from 'express-rate-limit';

export const apiKeyAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: { error: 'Too many authorization attempts, please try again later' }
});

export const apiKeyGenerateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 new keys per hour
  message: { error: 'Too many API key generation attempts, please try again later' }
});

export const articleReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per window
  message: { error: 'Too many article read attempts, please try again later' }
});

export const articleWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10000, // Limit each IP to 10000 write operations per hour
  message: { error: 'Too many article write attempts, please try again later' }
}); 