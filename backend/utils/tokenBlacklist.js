// utils/tokenBlacklist.js

// In-memory store for blacklisted JWTs
const tokenBlacklist = new Set();

/**
 * Add a token to the blacklist for a specific duration.
 * @param {string} token - The JWT token to blacklist
 * @param {number} expiryMs - Expiry in milliseconds (default 1 hour)
 */
function addToBlacklist(token, expiryMs = 3600000) {
  tokenBlacklist.add(token);
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, expiryMs);
}

/**
 * Check if a token is blacklisted.
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if blacklisted
 */
function isBlacklisted(token) {
  return tokenBlacklist.has(token);
}

module.exports = {
  tokenBlacklist,
  addToBlacklist,
  isBlacklisted
};
