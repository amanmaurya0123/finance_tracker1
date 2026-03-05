const authService = require('../services/authService');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.register(name, email, password);
    return res.status(201).json({ user, token });
  } catch (err) {
    if (err.message === 'Email already registered') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    return res.json({ user, token });
  } catch (err) {
    if (err.message === 'Invalid email or password') {
      return res.status(401).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Login failed' });
  }
}

async function getMe(req, res) {
  try {
    const user = await authService.getMe(req.userId);
    return res.json(user);
  } catch (err) {
    return res.status(404).json({ error: err.message || 'User not found' });
  }
}

module.exports = { register, login, getMe };
