/**
 * DivvyUp Client Authentication Service
 * Production SDK Integration for Google Sign-In (GSI) & Apple Sign-In
 */

const BACKEND_URL = 'http://localhost:4000';
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const APPLE_CLIENT_ID = 'com.divvyup.app.service';
const APPLE_REDIRECT_URI = window.location.origin;

class AuthService {
  constructor() {
    this.user = null;
    this.token = localStorage.getItem('divvyup_session_token') || null;
    this.googleLoaded = false;
    this.appleLoaded = false;
  }

  /**
   * Load Client SDK Scripts dynamically
   */
  async loadSDKs() {
    return Promise.all([this.loadGoogleSDK(), this.loadAppleSDK()]);
  }

  loadGoogleSDK() {
    return new Promise((resolve) => {
      if (window.google && window.google.accounts) {
        this.googleLoaded = true;
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.googleLoaded = true;
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  loadAppleSDK() {
    return new Promise((resolve) => {
      if (window.AppleID) {
        this.appleLoaded = true;
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/v1/appleid.auth.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.appleLoaded = true;
        if (window.AppleID) {
          window.AppleID.auth.init({
            clientId: APPLE_CLIENT_ID,
            scope: 'name email',
            redirectURI: APPLE_REDIRECT_URI,
            state: 'divvyup_auth_state',
            usePopup: true
          });
        }
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  /**
   * Trigger Google Sign-In Prompt
   */
  async signInWithGoogle() {
    await this.loadGoogleSDK();

    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.accounts) {
        return reject(new Error('Google Identity SDK failed to initialize'));
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response || !response.credential) {
            return reject(new Error('Google authentication was cancelled or failed'));
          }

          try {
            // Verify ID Token with Backend Server
            const authResult = await this.verifyBackendToken('/api/auth/google', {
              idToken: response.credential
            });
            this.setSession(authResult.user, authResult.token);
            resolve(authResult);
          } catch (err) {
            reject(err);
          }
        }
      });

      // Display Google One Tap or Trigger Prompt
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to explicit OAuth popup flow
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'openid profile email',
            callback: async (tokenResponse) => {
              if (tokenResponse.error) return reject(new Error(tokenResponse.error));
              // Token exchange with backend
              const authResult = await this.verifyBackendToken('/api/auth/google', {
                accessToken: tokenResponse.access_token
              });
              this.setSession(authResult.user, authResult.token);
              resolve(authResult);
            }
          });
          client.requestAccessToken();
        }
      });
    });
  }

  /**
   * Trigger Apple Sign-In Popup Flow
   */
  async signInWithApple() {
    await this.loadAppleSDK();

    return new Promise(async (resolve, reject) => {
      if (!window.AppleID) {
        return reject(new Error('Apple Sign-In SDK failed to load'));
      }

      try {
        const response = await window.AppleID.auth.signIn();
        if (!response || !response.authorization || !response.authorization.id_token) {
          return reject(new Error('Apple login was cancelled or returned empty credentials'));
        }

        const idToken = response.authorization.id_token;
        const fullName = response.user ? response.user.name : null;

        // Send Apple Identity Token to Backend Server for RSA Signature Verification
        const authResult = await this.verifyBackendToken('/api/auth/apple', {
          identityToken: idToken,
          fullName
        });

        this.setSession(authResult.user, authResult.token);
        resolve(authResult);
      } catch (error) {
        console.error('Apple Sign-In Error:', error);
        reject(new Error(error.error || 'Apple Sign-In failed or popup was closed.'));
      }
    });
  }

  /**
   * Send Token to Backend for Server-Side Verification
   */
  async verifyBackendToken(endpoint, payload) {
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication server verification failed');
      }
      return data;
    } catch (err) {
      throw new Error(`Auth verification failed: ${err.message}`);
    }
  }

  /**
   * Save Active Session
   */
  setSession(user, token) {
    this.user = user;
    this.token = token;
    localStorage.setItem('divvyup_session_user', JSON.stringify(user));
    localStorage.setItem('divvyup_session_token', token);
  }

  /**
   * Check Persistent Session on Load
   */
  async checkSession() {
    const savedUser = localStorage.getItem('divvyup_session_user');
    const token = localStorage.getItem('divvyup_session_token');

    if (!savedUser || !token) return null;

    try {
      // Validate session token with backend
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        this.user = data.user;
        this.token = token;
        return data.user;
      }
    } catch (err) {
      console.warn('Backend session validation failed, using cached user:', err.message);
    }

    try {
      this.user = JSON.parse(savedUser);
      return this.user;
    } catch (e) {
      this.logout();
      return null;
    }
  }

  /**
   * Logout User & Clear Session Tokens
   */
  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('divvyup_session_user');
    localStorage.removeItem('divvyup_session_token');
    
    // Revoke Google session if active
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }
}

export const authService = new AuthService();
