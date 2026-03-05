const pool = require('../config/database');
const {
  getCache,
  setCache,
  getAnalyticsKey,
  getCategoriesKey,
  CACHE_TTL,
} = require('../utils/cache');

async function getMonthlyOverview(userId, year) {
  const cacheKey = getAnalyticsKey(userId, `monthly_${year}`);
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await pool.query(
    `SELECT 
       DATE_TRUNC('month', date)::date as month,
       type,
       SUM(amount) as total
     FROM transactions
     WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2
     GROUP BY DATE_TRUNC('month', date), type
     ORDER BY month`,
    [userId, year]
  );

  const byMonth = {};
  result.rows.forEach((row) => {
    const m = row.month.toISOString().slice(0, 7);
    if (!byMonth[m]) byMonth[m] = { income: 0, expense: 0 };
    byMonth[m][row.type] = parseFloat(row.total);
  });

  const data = Object.entries(byMonth).map(([month, totals]) => ({
    month,
    ...totals,
    balance: totals.income - totals.expense,
  }));

  await setCache(cacheKey, data, CACHE_TTL.ANALYTICS);
  return data;
}

async function getCategoryBreakdown(userId, startDate, endDate) {
  const cacheKey = getAnalyticsKey(userId, `category_${startDate}_${endDate}`);
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await pool.query(
    `SELECT category, type, SUM(amount) as total
     FROM transactions
     WHERE user_id = $1 AND date >= $2 AND date <= $3
     GROUP BY category, type
     ORDER BY type, total DESC`,
    [userId, startDate, endDate]
  );

  const expenseByCategory = result.rows
    .filter((r) => r.type === 'expense')
    .map((r) => ({ category: r.category, total: parseFloat(r.total) }));

  await setCache(cacheKey, expenseByCategory, CACHE_TTL.ANALYTICS);
  return expenseByCategory;
}

async function getIncomeVsExpense(userId, startDate, endDate) {
  const cacheKey = getAnalyticsKey(userId, `income_vs_expense_${startDate}_${endDate}`);
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const result = await pool.query(
    `SELECT type, SUM(amount) as total
     FROM transactions
     WHERE user_id = $1 AND date >= $2 AND date <= $3
     GROUP BY type`,
    [userId, startDate, endDate]
  );

  const data = {
    income: 0,
    expense: 0,
  };
  result.rows.forEach((row) => {
    data[row.type] = parseFloat(row.total);
  });
  data.balance = data.income - data.expense;

  await setCache(cacheKey, data, CACHE_TTL.ANALYTICS);
  return data;
}

module.exports = {
  getMonthlyOverview,
  getCategoryBreakdown,
  getIncomeVsExpense,
};
