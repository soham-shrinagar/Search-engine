const jwt = require('jsonwebtoken');

const JWT_OPTIONS = { algorithms: ['HS256'] };

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, process.env.JWT_SECRET, JWT_OPTIONS);
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET, JWT_OPTIONS);
    } catch {
      req.user = null;
    }
  }
  next();
}

module.exports = { authenticate, optionalAuth };
