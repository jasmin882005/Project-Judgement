const tokenBlacklist = new Set();

// Add token to blacklist and auto-remove after expiry
function addToBlacklist(token, expiryMs = 3600000) {
  tokenBlacklist.add(token);
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, expiryMs);
}

module.exports = {
  tokenBlacklist,
  addToBlacklist
};
