const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    // const authHeader = req.header('Authorization');
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return res.status(401).json({ error: 'Authentication failed: No token provided or malformed token.' });
    // }
    // const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication failed: No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id || decoded._id); 

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed: User not found.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    let errorMessage = 'Please authenticate.';
    if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Authentication failed: Invalid token.';
    } else if (error.name === 'TokenExpiredError') {
        errorMessage = 'Authentication failed: Token expired.';
    } else if (error.message.includes('No token provided')) {
        errorMessage = error.message; // Use specific message if already set
    }
    res.status(401).json({ error: errorMessage, details: error.message });
  }
};

// Admin authorization middleware
const authorizeAdmin = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else if (!req.user) {
       if (!res.headersSent) {
            return res.status(401).json({ error: 'Authentication required.' });
       }
    }
    else {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
  });
};

module.exports = {
  authenticate,
  authorizeAdmin,
};
