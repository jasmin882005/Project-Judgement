const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { Log } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Log helper: creates standardized logs for all auth-related events
const logEvent = async ({ action, event, userId = null, createdBy = 'system', type = 'info', source = 'authController' }) => {
  await Log.create({ action, event, userId, createdBy, type, source });
};

// Generate short-lived access token (1 hour)
const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Generate refresh token (7 days) and persist in DB
const generateRefreshToken = async (user) => {
  const token = jwt.sign(user, process.env.REFRESH_SECRET, { expiresIn: '7d' });

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  await RefreshToken.create({
    token,
    userId: user.id,
    expiryDate,
  });

  return token;
};

// Register new user
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed, role });

    await logEvent({
      action: 'SIGNUP',
      event: `${newUser.name} signed up`,
      userId: newUser.id,
      createdBy: newUser.email,
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Authenticate user and issue tokens
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      await logEvent({
        action: 'FAILED_LOGIN',
        event: `Login failed - user not found for email: ${email}`,
        createdBy: email,
        type: 'warning',
      });
      return res.status(404).json({ error: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await logEvent({
        action: 'FAILED_LOGIN',
        event: `Login failed - incorrect password for ${email}`,
        userId: user.id,
        createdBy: user.email,
        type: 'warning',
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { id: user.id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    await logEvent({
      action: 'LOGIN',
      event: `${user.name} logged in`,
      userId: user.id,
      createdBy: user.email,
    });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Handle token renewal using refresh token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    await logEvent({
      action: 'REFRESH_FAILED',
      event: 'Refresh token missing in request',
      createdBy: 'unknown',
      type: 'warning',
    });
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const found = await RefreshToken.findOne({ where: { token: refreshToken } });

    if (!found) {
      await logEvent({
        action: 'REFRESH_FAILED',
        event: 'Refresh token not found in database',
        createdBy: 'unknown',
        type: 'warning',
      });
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    if (new Date() > found.expiryDate) {
      await found.destroy();

      const decoded = jwt.decode(refreshToken);
      await logEvent({
        action: 'REFRESH_EXPIRED',
        event: `Expired refresh token used by ${decoded?.email || 'unknown'}`,
        userId: decoded?.id || null,
        createdBy: decoded?.email || 'unknown',
        type: 'warning',
      });

      return res.status(403).json({ error: 'Refresh token expired' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, user) => {
      if (err) {
        await logEvent({
          action: 'REFRESH_FAILED',
          event: 'Refresh token verification failed',
          createdBy: 'unknown',
          type: 'warning',
        });

        return res.status(403).json({ error: 'Token verification failed' });
      }

      const payload = { id: user.id, role: user.role, email: user.email };
      const newAccessToken = generateAccessToken(payload);

      await logEvent({
        action: 'REFRESH_SUCCESS',
        event: `${user.email} refreshed access token`,
        userId: user.id,
        createdBy: user.email,
      });

      res.json({ accessToken: newAccessToken });
    });
  } catch (err) {
    res.status(500).json({ error: 'Token processing failed' });
  }
};

// Invalidate refresh token (logout)
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const deleted = await RefreshToken.destroy({ where: { token: refreshToken } });

    if (deleted) {
      const decoded = jwt.decode(refreshToken);

      if (decoded && decoded.email) {
        await logEvent({
          action: 'LOGOUT',
          event: `${decoded.email} logged out`,
          userId: decoded.id,
          createdBy: decoded.email,
        });
      }

      return res.json({ message: 'Logged out successfully' });
    }

    res.status(404).json({ error: 'Token not found' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
};
