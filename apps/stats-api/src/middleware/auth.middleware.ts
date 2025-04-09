import { Request, Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import { UnauthorizedError } from 'express-oauth2-jwt-bearer';
import logger from '../utils/logger';

// Initialize Auth0 middleware
const validateAuth0Token = auth({
  audience: 'https://stats-api',
  issuerBaseURL: `https://${process.env['AUTH0_DOMAIN']}/`,
  tokenSigningAlg: 'RS256',
});

// Define a type for the Auth0 payload
interface Auth0Payload {
  permissions?: string[];
  [key: string]: any;
}

// Middleware to check if user has admin role
export const requireAdminRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // First validate the token
    await new Promise<void>((resolve, reject) => {
      validateAuth0Token(req, res, (err) => {
        if (err) {
          logger.error('Error validating token', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Check if user has admin role
    const authPayload = (req as any).auth?.payload as Auth0Payload;
    const permissions = authPayload?.permissions || [];

    if (!permissions.includes('admin')) {
      throw new UnauthorizedError('Insufficient permissions');
    }

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions to access this resource',
      });
    } else {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }
  }
};

// Middleware to validate token but not require specific roles
export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await new Promise<void>((resolve, reject) => {
      validateAuth0Token(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};
