import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private rateLimiter = new RateLimiterMemory({
    points: 100, // Number of points
    duration: 60, // Per minute
  });

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract IP from request
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      
      // Consume points from the rate limiter
      await this.rateLimiter.consume(ip.toString());
      
      // If we get here, the request is allowed
      next();
    } catch (rejRes) {
      // If we catch an error, the rate limit was exceeded
      res.status(429).json({
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
      });
    }
  }
}
