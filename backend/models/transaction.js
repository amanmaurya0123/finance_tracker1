const pool = require('../config/database');

const create = async (userId, type, amount, category, description, date) => {
  const result = await pool.query(
    `INSERT INTO transactions (user_id, type, amount, category, description, date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, type, amount, category, description || null, date]
  );
  return result.rows[0];
};

const findById = async (id, userId = null, isAdmin = false) => {
  let query = 'SELECT * FROM transactions WHERE id = $1';
  const params = [id];
  if (!isAdmin && userId) {
    query += ' AND user_id = $2';
    params.push(userId);
  }
  const result = await pool.query(query, params);
  return result.rows[0];
};

const findByUser = async (userId, options = {}) => {
  const {
    search,
    category,
    type,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = options;

  let query = 'SELECT * FROM transactions WHERE user_id = $1';
  const params = [userId];
  let paramIndex = 2;

  if (search) {
    query += ` AND (description ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }
  if (category) {
    query += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }
  if (type) {
    query += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }
  if (startDate) {
    query += ` AND date >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }
  if (endDate) {
    query += ` AND date <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  const countResult = await pool.query(
    query.replace('SELECT *', 'SELECT COUNT(*) as total'),
    params
  );
  const total = parseInt(countResult.rows[0].total, 10);

  query += ' ORDER BY date DESC, created_at DESC';
  const offset = (page - 1) * limit;
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return { rows: result.rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const findAllForAdmin = async (options = {}) => {
  const { search, category, type, startDate, endDate, page = 1, limit = 20 } = options;

  let query = 'SELECT t.*, u.name as user_name, u.email as user_email FROM transactions t JOIN users u ON t.user_id = u.id WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (t.description ILIKE $${paramIndex} OR t.category ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }
  if (category) {
    query += ` AND t.category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }
  if (type) {
    query += ` AND t.type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }
  if (startDate) {
    query += ` AND t.date >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }
  if (endDate) {
    query += ` AND t.date <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  const countResult = await pool.query(
    query.replace('SELECT t.*, u.name as user_name, u.email as user_email', 'SELECT COUNT(*) as total'),
    params
  );
  const total = parseInt(countResult.rows[0].total, 10);

  query += ' ORDER BY t.date DESC, t.created_at DESC';
  const offset = (page - 1) * limit;
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return { rows: result.rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const update = async (id, userId, data, isAdmin = false) => {
  const { type, amount, category, description, date } = data;
  let query = 'UPDATE transactions SET type = $1, amount = $2, category = $3, description = $4, date = $5 WHERE id = $6';
  const params = [type, amount, category, description || null, date, id];
  if (!isAdmin) {
    query += ' AND user_id = $7';
    params.push(userId);
  }
  query += ' RETURNING *';
  const result = await pool.query(query, params);
  return result.rows[0];
};

const remove = async (id, userId = null, isAdmin = false) => {
  let query = 'DELETE FROM transactions WHERE id = $1';
  const params = [id];
  if (!isAdmin && userId) {
    query += ' AND user_id = $2';
    params.push(userId);
  }
  query += ' RETURNING id';
  const result = await pool.query(query, params);
  return result.rows[0];
};

const getCategoriesByUser = async (userId) => {
  const result = await pool.query(
    'SELECT DISTINCT category FROM transactions WHERE user_id = $1 ORDER BY category',
    [userId]
  );
  return result.rows.map((r) => r.category);
};

module.exports = {
  create,
  findById,
  findByUser,
  findAllForAdmin,
  update,
  remove,
  getCategoriesByUser,
};
