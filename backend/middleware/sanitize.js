const { body, param, query } = require('express-validator');

const sanitizeString = (field) =>
  body(field)
    .trim()
    .escape()
    .optional({ nullable: true });

const sanitizeParamId = () => param('id').isInt().toInt();

const registerValidation = [
  body('name').trim().escape().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().normalizeEmail().isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Password must contain letters and numbers'),
];

const loginValidation = [
  body('email').trim().normalizeEmail().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const transactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('category').trim().escape().notEmpty().withMessage('Category is required').isLength({ max: 50 }),
  body('description').trim().escape().optional({ nullable: true }).isLength({ max: 500 }),
  body('date').isISO8601().withMessage('Valid date is required'),
];

const transactionUpdateValidation = [
  param('id').isInt().toInt(),
  body('type').optional().isIn(['income', 'expense']),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('category').optional().trim().escape().isLength({ max: 50 }),
  body('description').optional().trim().escape().isLength({ max: 500 }),
  body('date').optional().isISO8601(),
];

const queryPagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().trim().escape().isLength({ max: 100 }),
  query('category').optional().trim().escape().isLength({ max: 50 }),
  query('type').optional().isIn(['income', 'expense']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];

module.exports = {
  registerValidation,
  loginValidation,
  transactionValidation,
  transactionUpdateValidation,
  queryPagination,
  sanitizeParamId,
};
