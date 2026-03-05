const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');
const { analyticsLimiter } = require('../middleware/rateLimit');

router.use(authMiddleware);
router.use(analyticsLimiter);

/**
 * @swagger
 * /analytics/monthly:
 *   get:
 *     summary: Monthly spending overview
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Monthly income/expense/balance per month }
 */
router.get('/monthly', analyticsController.getMonthly);

/**
 * @swagger
 * /analytics/category:
 *   get:
 *     summary: Category-wise expense breakdown
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Category totals }
 */
router.get('/category', analyticsController.getCategory);

/**
 * @swagger
 * /analytics/income-vs-expense:
 *   get:
 *     summary: Income vs expense trends
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: income, expense, balance }
 */
router.get('/income-vs-expense', analyticsController.getIncomeVsExpense);

module.exports = router;
