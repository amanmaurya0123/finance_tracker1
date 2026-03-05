const analyticsService = require('../services/analyticsService');

async function getMonthly(req, res) {
  try {
    const year = req.query.year
      ? parseInt(req.query.year, 10)
      : new Date().getFullYear();
    const data = await analyticsService.getMonthlyOverview(req.userId, year);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch monthly analytics' });
  }
}

async function getCategory(req, res) {
  try {
    const now = new Date();
    const startDate =
      req.query.startDate ||
      new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const endDate =
      req.query.endDate || now.toISOString().slice(0, 10);
    const data = await analyticsService.getCategoryBreakdown(
      req.userId,
      startDate,
      endDate
    );
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch category analytics' });
  }
}

async function getIncomeVsExpense(req, res) {
  try {
    const now = new Date();
    const startDate =
      req.query.startDate ||
      new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
    const endDate =
      req.query.endDate || now.toISOString().slice(0, 10);
    const data = await analyticsService.getIncomeVsExpense(
      req.userId,
      startDate,
      endDate
    );
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch income vs expense' });
  }
}

module.exports = { getMonthly, getCategory, getIncomeVsExpense };
