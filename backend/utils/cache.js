const redis = require('../config/redis');

const CACHE_TTL = {
  ANALYTICS: 900,      // 15 minutes
  CATEGORIES: 3600,    // 1 hour
};

async function getCache(key) {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Cache get error:', err.message);
    return null;
  }
}

async function setCache(key, value, ttlSeconds) {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('Cache set error:', err.message);
    return false;
  }
}

async function invalidateCache(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (err) {
    console.error('Cache invalidate error:', err.message);
    return false;
  }
}

function getAnalyticsKey(userId, type) {
  return `analytics:${userId}:${type}`;
}

function getCategoriesKey(userId) {
  return `categories:${userId}`;
}

function getTransactionsInvalidationPattern(userId) {
  return `analytics:${userId}:*`;
}

module.exports = {
  getCache,
  setCache,
  invalidateCache,
  CACHE_TTL,
  getAnalyticsKey,
  getCategoriesKey,
  getTransactionsInvalidationPattern,
};
