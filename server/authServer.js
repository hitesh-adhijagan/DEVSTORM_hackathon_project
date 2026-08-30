/**
 * DivvyUp Production Authentication Backend Microservice
 * Stack: Node.js (ESM), Express, Google Auth Library, jsonwebtoken, jwks-rsa
 * 
 * Features:
 * 1. Verifies Google ID Tokens (Identity Services / One Tap)
 * 2. Verifies Apple Identity Tokens (JWKS RSA Key Sets)
 * 3. Handles User Upsert (Database / In-Memory Mock Store)
 * 4. Issues Secure DivvyUp JWT Session Tokens
 */

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import jwksClient from 'jwks-rsa';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Environment Configuration (Set in .env or deployment environment)
const CONFIG = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'divvyup_production_jwt_super_secret_key_2026',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID || 'com.divvyup.app.service', // Apple Services ID
};

// Google OAuth2 Client Initializer
const googleOAuthClient = new OAuth2Client(CONFIG.GOOGLE_CLIENT_ID);

// Apple JWKS Client (Fetches Apple's Public Keys dynamically for Token Verification)
const appleJwksClient = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 86400000 // 24 hours
});

// Helper to get Apple Public Signing Key by Key ID (kid)
function getAppleSigningKey(header, callback) {
  appleJwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err, null);
    const signingKey = key.getPublicKey() || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// In-Memory Database User Store (Replace with PostgreSQL / MongoDB / Supabase DB)
const userDatabase = new Map();

/**
 * --------------------------------------------------------------------------
 * 1. POST /api/auth/google
 * Real Google ID Token Verification API Endpoint
 * --------------------------------------------------------------------------
 */
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, error: 'Google idToken is required' });
    }

    // Verify Google ID Token with Google Auth Library
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: idToken,
      audience: CONFIG.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email_verified) {
      return res.status(401).json({ success: false, error: 'Unverified Google Account' });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Database Lookup or User Upsert
    let user = userDatabase.get(email);
    if (!user) {
      user = {
        id: `user_g_${googleId}`,
        name: name || email.split('@')[0],
        email: email,
        avatar: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}`,
        provider: 'google',
        createdAt: new Date().toISOString()
      };
      userDatabase.set(email, user);
    }

    // Issue Secure Session JWT
    const sessionToken = jwt.sign(
      { userId: user.id, email: user.email, provider: 'google' },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      user,
      token: sessionToken,
      message: 'Successfully authenticated with Google'
    });
  } catch (error) {
    console.error('[Google Auth Error]:', error.message);
    return res.status(401).json({ success: false, error: 'Invalid or expired Google Token', details: error.message });
  }
});

/**
 * --------------------------------------------------------------------------
 * 2. POST /api/auth/apple
 * Real Apple Identity Token Verification API Endpoint
 * --------------------------------------------------------------------------
 */
app.post('/api/auth/apple', async (req, res) => {
  try {
    const { identityToken, fullName } = req.body;
    if (!identityToken) {
      return res.status(400).json({ success: false, error: 'Apple identityToken is required' });
    }

    // Verify Apple JWT Token using Apple Public Keys (JWKS RSA)
    const decodedPayload = await new Promise((resolve, reject) => {
      jwt.verify(
        identityToken,
        getAppleSigningKey,
        {
          issuer: 'https://appleid.apple.com',
          audience: CONFIG.APPLE_CLIENT_ID,
          algorithms: ['RS256']
        },
        (err, decoded) => {
          if (err) return reject(err);
          resolve(decoded);
        }
      );
    });

    const appleUserId = decodedPayload.sub;
    const email = decodedPayload.email;

    // Determine User Name (Apple only sends fullName on the FIRST login)
    let displayName = "Apple User";
    if (fullName && (fullName.firstName || fullName.lastName)) {
      displayName = `${fullName.firstName || ''} ${fullName.lastName || ''}`.trim();
    }

    // Database Lookup or User Upsert
    let user = userDatabase.get(email || appleUserId);
    if (!user) {
      user = {
        id: `user_a_${appleUserId}`,
        name: displayName,
        email: email || `${appleUserId}@privaterelay.appleid.com`,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`,
        provider: 'apple',
        createdAt: new Date().toISOString()
      };
      userDatabase.set(email || appleUserId, user);
    }

    // Issue Secure Session JWT
    const sessionToken = jwt.sign(
      { userId: user.id, email: user.email, provider: 'apple' },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      user,
      token: sessionToken,
      message: 'Successfully authenticated with Apple ID'
    });
  } catch (error) {
    console.error('[Apple Auth Error]:', error.message);
    return res.status(401).json({ success: false, error: 'Invalid or expired Apple Identity Token', details: error.message });
  }
});

/**
 * --------------------------------------------------------------------------
 * 3. GET /api/auth/me
 * Validate Session JWT Token Endpoint
 * --------------------------------------------------------------------------
 */
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
    const user = Array.from(userDatabase.values()).find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session token' });
  }
});

app.listen(CONFIG.PORT, () => {
  console.log(`🚀 DivvyUp Authentication Microservice listening on http://localhost:${CONFIG.PORT}`);
});
