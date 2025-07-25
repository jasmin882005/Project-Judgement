// utils/tokenBlacklist.js

const tokenBlacklist = new Set();

function addToBlacklist(token, expiryMs = 3600000) {
  tokenBlacklist.add(token);
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, expiryMs);
}

function isBlacklisted(token) {
  return tokenBlacklist.has(token);
}

module.exports = {
  tokenBlacklist,
  addToBlacklist,
  isBlacklisted
};
