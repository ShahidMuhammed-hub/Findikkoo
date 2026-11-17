import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { PublicUser, UserRecord } from '../src/shared/types';

function resolveTokenSecret(): string {
  const envSecret = process.env.JWT_SECRET?.trim();
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    if (
      !envSecret ||
      envSecret.length < 16 ||
      envSecret === 'unscroll-dev-session-secret-change-in-production'
    ) {
      throw new Error(
        'FATAL: JWT_SECRET must be configured with a strong secret (at least 16 characters) in production.'
      );
    }
    return envSecret;
  }

  if (envSecret && envSecret.length >= 16) {
    return envSecret;
  }

  console.warn(
    '[Findikoo auth] JWT_SECRET not set in development; using an ephemeral random session key for this server process.'
  );
  return crypto.randomBytes(32).toString('hex');
}

const TOKEN_SECRET = resolveTokenSecret();

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(keyHex, 'hex');
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
}

export function hashResetCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

export function verifyResetCode(code: string, storedHash: string): boolean {
  try {
    const candidate = Buffer.from(hashResetCode(code), 'hex');
    const stored = Buffer.from(storedHash, 'hex');
    if (candidate.length !== stored.length) return false;
    return crypto.timingSafeEqual(candidate, stored);
  } catch {
    return false;
  }
}

export interface TokenPayload {
  userId: string;
  role: string;
  exp: number;
}

export function signSessionToken(user: UserRecord): string {
  const payload: TokenPayload = {
    userId: user.id,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;
  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encoded)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as TokenPayload;
    if (!parsed.userId || !parsed.exp || Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function toPublicUser(user: UserRecord): PublicUser {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

export interface AuthenticatedRequest extends Request {
  authUser?: UserRecord;
}

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const c of cookies) {
      if (c.startsWith('findikoo_token=')) {
        return decodeURIComponent(c.slice('findikoo_token='.length));
      }
      if (c.startsWith('unscroll_token=')) {
        return decodeURIComponent(c.slice('unscroll_token='.length));
      }
    }
  }
  return null;
}

export function requireRole(role: 'admin' | 'user') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.authUser) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (role === 'admin' && req.authUser.role !== 'admin') {
      res.status(403).json({ error: 'Administrator permission required.' });
      return;
    }
    next();
  };
}
