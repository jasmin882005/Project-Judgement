// In-memory token blacklist — for tracking logout tokens (non-persistent, resets on server restart)
const tokenBlacklist = new Set();

/**
 * Add a token to the blacklist and schedule auto-removal after expiry.
 * @param {string} token - JWT to blacklist
 * @param {number} expiryMs - Expiration time in milliseconds (default: 1 hour)
 */
function addToBlacklist(token, expiryMs = 3600000) {
  tokenBlacklist.add(token);
  console.log(`[BLACKLIST] Added token. Will auto-remove in ${expiryMs / 1000}s`);

  // Auto-remove after token expires
  setTimeout(() => {
    tokenBlacklist.delete(token);
    console.log(`[BLACKLIST] Token auto-removed from blacklist.`);
  }, expiryMs);
}

/**
 * Check if a token is currently blacklisted (used during auth validation)
 * @param {string} token
 * @returns {boolean}
 */
function isBlacklisted(token) {
  return tokenBlacklist.has(token);
}

module.exports = {
  tokenBlacklist,
  addToBlacklist,
  isBlacklisted
};
