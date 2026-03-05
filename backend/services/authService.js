const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

const SALT_ROUNDS = 10;
const JWT_EXPIRES = '7d';

async function register(name, email, password) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new Error('Email already registered');
  }
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.create(name, email, hashedPassword);
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'your-jwt-secret',
    { expiresIn: JWT_EXPIRES }
  );
  return { user, token };
}

async function login(email, password) {
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error('Invalid email or password');
  }
  const { password: _, ...userWithoutPassword } = user;
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'your-jwt-secret',
    { expiresIn: JWT_EXPIRES }
  );
  return { user: userWithoutPassword, token };
}

async function getMe(userId) {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

module.exports = { register, login, getMe };
