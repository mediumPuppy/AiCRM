import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests, please try again later' }
});

// More strict limiter for authentication routes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later' }
});

// Limiter for user write operations
export const userWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: 'Too many user write attempts, please try again later' }
});

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

export const contactReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per window
  message: { error: 'Too many contact read attempts, please try again later' }
});

export const contactWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 write operations per hour
  message: { error: 'Too many contact write attempts, please try again later' }
});

export const customFieldReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: { error: 'Too many custom field read attempts, please try again later' }
});

export const customFieldWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 write operations per hour
  message: { error: 'Too many custom field write attempts, please try again later' }
});

export const noteReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per window
  message: { error: 'Too many note read attempts, please try again later' }
});

export const noteWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 write operations per hour
  message: { error: 'Too many note write attempts, please try again later' }
});

export const portalSessionReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per window
  message: { error: 'Too many portal session read attempts, please try again later' }
});

export const portalSessionWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 write operations per hour
  message: { error: 'Too many portal session write attempts, please try again later' }
});

export const tagReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per window
  message: { error: 'Too many tag read attempts, please try again later' }
});

export const tagWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 write operations per hour
  message: { error: 'Too many tag write attempts, please try again later' }
});

export const teamReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per window
  message: { error: 'Too many team read attempts, please try again later' }
});

export const teamWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 write operations per hour
  message: { error: 'Too many team write attempts, please try again later' }
});

export const ticketReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per window
  message: { error: 'Too many ticket read attempts, please try again later' }
});

export const ticketWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 write operations per hour
  message: { error: 'Too many ticket write attempts, please try again later' }
});

export const userReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per window
  message: { error: 'Too many user read attempts, please try again later' }
});

export const webhookReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per window
  message: { error: 'Too many webhook read attempts, please try again later' }
});

export const webhookWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 write operations per hour
  message: { error: 'Too many webhook write attempts, please try again later' }
});

export const attachmentReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per window
  message: { error: 'Too many attachment read attempts, please try again later' }
});

export const attachmentWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 write operations per hour
  message: { error: 'Too many attachment write attempts, please try again later' }
});

