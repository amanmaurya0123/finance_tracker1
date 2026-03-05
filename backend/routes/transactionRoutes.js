const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const { transactionLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validator');
const {
  transactionValidation,
  transactionUpdateValidation,
  queryPagination,
} = require('../middleware/sanitize');

router.use(authMiddleware);
router.use(transactionLimiter);

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: List transactions (with filters and pagination)
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Paginated transactions }
 */
router.get('/', queryPagination, validate, transactionController.getTransactions);

/**
 * @swagger
 * /transactions/categories:
 *   get:
 *     summary: Get distinct categories for user
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Array of category strings }
 */
router.get('/categories', transactionController.getCategories);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Transaction }
 *       404: { description: Not found }
 */
router.get('/:id', transactionController.getTransactionById);

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create transaction (admin, user only)
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, amount, category, date]
 *             properties:
 *               type: { type: string, enum: [income, expense] }
 *               amount: { type: number }
 *               category: { type: string }
 *               description: { type: string }
 *               date: { type: string, format: date }
 *     responses:
 *       201: { description: Created transaction }
 *       403: { description: Read-only role }
 */
router.post(
  '/',
  roleMiddleware('admin', 'user'),
  transactionValidation,
  validate,
  transactionController.createTransaction
);

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     summary: Update transaction (admin, user only)
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type: { type: string, enum: [income, expense] }
 *               amount: { type: number }
 *               category: { type: string }
 *               description: { type: string }
 *               date: { type: string, format: date }
 *     responses:
 *       200: { description: Updated transaction }
 *       403: { description: Read-only role }
 *       404: { description: Not found }
 */
router.put(
  '/:id',
  roleMiddleware('admin', 'user'),
  transactionUpdateValidation,
  validate,
  transactionController.updateTransaction
);

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete transaction (admin, user only)
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Deleted }
 *       403: { description: Read-only role }
 *       404: { description: Not found }
 */
router.delete(
  '/:id',
  roleMiddleware('admin', 'user'),
  transactionController.deleteTransaction
);

module.exports = router;
