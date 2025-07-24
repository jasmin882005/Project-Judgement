const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { Log } = require('../models'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Access token (short-lived)
const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Refresh token (stored in DB, longer-lived)
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

// Signup
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed, role });

    // Log signup
    await Log.create({
      userId: newUser.id,
      action: 'SIGNUP',
      event: `${newUser.name} signed up`,
      createdBy: newUser.email,
      type: 'info',
      source: 'authController'
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!user) {
      // Log failed login - user not found
      await Log.create({
        action: 'FAILED_LOGIN',
        event: `Login failed - user not found for email: ${email}`,
        userId: null,
        createdBy: email,
        type: 'warning',
        source: 'authController'
      });
      return res.status(404).json({ error: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // Log failed login - incorrect password
      await Log.create({
        action: 'FAILED_LOGIN',
        event: `Login failed - incorrect password for ${email}`,
        userId: user.id,
        createdBy: user.email,
        type: 'warning',
        source: 'authController'
      });

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { id: user.id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    // Log login
    await Log.create({
      userId: user.id,
      action: 'LOGIN',
      event: `${user.name} logged in`,
      createdBy: user.email,
      type: 'info',
      source: 'authController'
    });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Refresh token → generate new access token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const found = await RefreshToken.findOne({ where: { token: refreshToken } });

    if (!found) return res.status(403).json({ error: 'Invalid refresh token' });

    if (new Date() > found.expiryDate) {
      await found.destroy();
      return res.status(403).json({ error: 'Refresh token expired' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Token verification failed' });

      const payload = { id: user.id, role: user.role, email: user.email };
      const newAccessToken = generateAccessToken(payload);

      res.json({ accessToken: newAccessToken });
    });
  } catch (err) {
    res.status(500).json({ error: 'Token processing failed' });
  }
};

// Logout → delete refresh token
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const deleted = await RefreshToken.destroy({ where: { token: refreshToken } });

    if (deleted) {
      // Decode the refresh token to get user info
      const decoded = jwt.decode(refreshToken);

      if (decoded && decoded.email) {
        await Log.create({
          userId: decoded.id,
          action: 'LOGOUT',
          event: `${decoded.email} logged out`,
          createdBy: decoded.email,
          type: 'info',
          source: 'authController'
        });
      }

      return res.json({ message: 'Logged out successfully' });
    }

    res.status(404).json({ error: 'Token not found' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
};
