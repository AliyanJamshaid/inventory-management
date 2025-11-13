/**
 * Express type definitions extension
 * Extends the Express Request interface to include custom properties
 */

import { IJwtPayload } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
      requestId?: string;
    }
  }
}

export {};
