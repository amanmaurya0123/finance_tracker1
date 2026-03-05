const transactionService = require('../services/transactionService');
const { getCache, setCache, getCategoriesKey, CACHE_TTL } = require('../utils/cache');

async function createTransaction(req, res) {
  try {
    const { type, amount, category, description, date } = req.body;
    const tx = await transactionService.createTransaction(req.userId, {
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
    });
    return res.status(201).json(tx);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create transaction' });
  }
}

async function getTransactions(req, res) {
  try {
    const { page, limit, search, category, type, startDate, endDate } = req.query;
    const options = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search: search || undefined,
      category: category || undefined,
      type: type || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
    const result = await transactionService.getTransactions(
      req.userId,
      req.userRole,
      options
    );
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

async function getTransactionById(req, res) {
  try {
    const { id } = req.params;
    const tx = await transactionService.getTransactionById(
      id,
      req.userId,
      req.userRole === 'admin'
    );
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    return res.json(tx);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch transaction' });
  }
}

async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const { type, amount, category, description, date } = req.body;
    const data = {};
    if (type !== undefined) data.type = type;
    if (amount !== undefined) data.amount = parseFloat(amount);
    if (category !== undefined) data.category = category;
    if (description !== undefined) data.description = description;
    if (date !== undefined) data.date = date;

    const existing = await transactionService.getTransactionById(
      id,
      req.userId,
      req.userRole === 'admin'
    );
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const fullData = {
      type: data.type ?? existing.type,
      amount: data.amount ?? existing.amount,
      category: data.category ?? existing.category,
      description: data.description !== undefined ? data.description : existing.description,
      date: data.date ?? existing.date,
    };

    const tx = await transactionService.updateTransaction(
      id,
      req.userId,
      req.userRole,
      fullData
    );
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    return res.json(tx);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update transaction' });
  }
}

async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const deleted = await transactionService.deleteTransaction(
      id,
      req.userId,
      req.userRole
    );
    if (!deleted) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete transaction' });
  }
}

async function getCategories(req, res) {
  try {
    const cacheKey = getCategoriesKey(req.userId);
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const categories = await transactionService.getCategories(req.userId);
    await setCache(cacheKey, categories, CACHE_TTL.CATEGORIES);
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getCategories,
};
