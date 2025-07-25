// In-memory token blacklist (non-persistent)
const tokenBlacklist = new Set();

/**
 * Add token to blacklist and remove it after expiry.
 * @param {string} token - JWT to blacklist
 * @param {number} expiryMs - Token expiry duration in milliseconds
 */
function addToBlacklist(token, expiryMs = 3600000) {
  tokenBlacklist.add(token);
  console.log(`[BLACKLIST] Added token. Will auto-remove in ${expiryMs / 1000}s`);

  setTimeout(() => {
    tokenBlacklist.delete(token);
    console.log(`[BLACKLIST] Token auto-removed from blacklist.`);
  }, expiryMs);
}

/**
 * Check if token is currently blacklisted
 */
function isBlacklisted(token) {
  return tokenBlacklist.has(token);
}

module.exports = {
  tokenBlacklist,
  addToBlacklist,
  isBlacklisted
};
