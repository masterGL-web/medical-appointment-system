// src/lib/crypto-code.ts

export function generateActivationCode(): string {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
}

/**
 * Returns an ISO-8601 string N hours from now.
 * Default: 24 hours (standard activation window).
 */
export function expiresInHours(hours = 24): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}