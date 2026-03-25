const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cs-system-secret-key';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: '请先登录' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: '登录已过期' });
  }
}

module.exports = authMiddleware;
