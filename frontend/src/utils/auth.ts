// src/utils/auth.ts

import { jwtDecode } from "jwt-decode";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

export interface DecodedToken {
  exp: number;              // Token expiry (in seconds)
  iat?: number;             // Issued at (optional)
  [key: string]: any;       // Additional claims
}

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const TOKEN_KEY = 'smartshop_token';

// --------------------------------------------------
// TOKEN STORAGE HELPERS
// --------------------------------------------------

/**
 * Save the JWT token in localStorage.
 */
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get the stored JWT token.
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove the token from storage (logout).
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check whether a token is present and valid (not expired).
 */
export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch (e) {
    console.error("Invalid token:", e);
    return false;
  }
}

/**
 * Get decoded token payload.
 */
export function getDecodedToken(): DecodedToken | null {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded;
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
}
