const userModel = require('../models/user');

async function getUsers(req, res) {
  try {
    const users = await userModel.getAll();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

module.exports = { getUsers };
