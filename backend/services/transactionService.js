const transactionModel = require('../models/transaction');
const { invalidateCache, getCategoriesKey, getTransactionsInvalidationPattern } = require('../utils/cache');

async function createTransaction(userId, data) {
  const tx = await transactionModel.create(
    userId,
    data.type,
    data.amount,
    data.category,
    data.description,
    data.date
  );
  await invalidateCache(getTransactionsInvalidationPattern(userId));
  await invalidateCache(getCategoriesKey(userId));
  return tx;
}

async function getTransactions(userId, role, options) {
  if (role === 'admin') {
    return transactionModel.findAllForAdmin(options);
  }
  return transactionModel.findByUser(userId, options);
}

async function getTransactionById(id, userId, isAdmin) {
  return transactionModel.findById(id, userId, isAdmin);
}

async function updateTransaction(id, userId, role, data) {
  const isAdmin = role === 'admin';
  const existing = await transactionModel.findById(id, userId, isAdmin);
  if (!existing) return null;
  const tx = await transactionModel.update(id, userId, data, isAdmin);
  if (tx) {
    const ownerId = existing.user_id;
    await invalidateCache(getTransactionsInvalidationPattern(ownerId));
    await invalidateCache(getCategoriesKey(ownerId));
  }
  return tx;
}

async function deleteTransaction(id, userId, role) {
  const isAdmin = role === 'admin';
  const existing = await transactionModel.findById(id, userId, isAdmin);
  if (!existing) return null;
  const deleted = await transactionModel.remove(id, userId, isAdmin);
  if (deleted) {
    const ownerId = existing.user_id;
    await invalidateCache(getTransactionsInvalidationPattern(ownerId));
    await invalidateCache(getCategoriesKey(ownerId));
  }
  return deleted;
}

async function getCategories(userId) {
  return transactionModel.getCategoriesByUser(userId);
}

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getCategories,
};
