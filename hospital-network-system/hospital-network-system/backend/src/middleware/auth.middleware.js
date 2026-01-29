import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided. Access denied.' 
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid or expired token.' 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: 'Authentication error.',
      error: error.message 
    });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      } catch (error) {
        // Invalid token, but we don't fail - just continue without user
        req.user = null;
      }
    }
    next();
  } catch (error) {
    next();
  }
};
