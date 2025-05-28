const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Path confirmed by `ls models`

// General user authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication failed: No token provided or malformed token.' });
    }
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      // This case should ideally be caught by the check above, but as a fallback:
      return res.status(401).json({ error: 'Authentication failed: No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is in .env

    // Fetch user from database to ensure they exist and have up-to-date info
    // Mongoose uses _id by default, but JWT payload might use 'id' or '_id'
    const user = await User.findById(decoded.id || decoded._id); 

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed: User not found.' });
    }

    req.user = user; // Attaches the full user document
    req.token = token; // Optional: if needed for logout or other purposes
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
  // First, run the general authentication
  authenticate(req, res, () => {
    // If authentication was successful and req.user is set
    if (req.user && req.user.role === 'admin') {
      next(); // User is admin, proceed
    } else if (!req.user) {
      // This case should ideally be handled by `authenticate` sending a response,
      // but as a safeguard if `authenticate` somehow calls next() on error.
      // However, `authenticate` above always sends a response on error or success.
      // If `authenticate` failed, it would have already sent a response.
      // So, if we reach here and !req.user, it implies an issue in `authenticate` logic.
      // For robustness, ensure a response if req.user isn't set by `authenticate`.
      // This typically shouldn't be hit if `authenticate` is correctly implemented.
       if (!res.headersSent) {
            return res.status(401).json({ error: 'Authentication required.' });
       }
    }
    else {
      // User is authenticated but not an admin
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
  });
};

module.exports = {
  authenticate,
  authorizeAdmin,
};
