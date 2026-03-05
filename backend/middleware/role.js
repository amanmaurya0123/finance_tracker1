const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (allowedRoles.includes(req.userRole)) {
      return next();
    }
    return res.status(403).json({ error: 'Insufficient permissions.' });
  };
};

module.exports = roleMiddleware;
