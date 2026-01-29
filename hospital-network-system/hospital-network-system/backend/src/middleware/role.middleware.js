/**
 * Role-Based Access Control Middleware
 * Restricts access to routes based on user roles
 */

export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required.' 
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        userRole: userRole
      });
    }

    next();
  };
};

/**
 * Hospital isolation middleware
 * Ensures users can only access data from their own hospital
 * (except SUPER_ADMIN who can access all)
 */
export const enforceHospitalIsolation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required.' 
    });
  }

  // Super admins can access all hospitals
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  // Ensure user has a hospital_id
  if (!req.user.hospitalId) {
    return res.status(403).json({ 
      success: false,
      message: 'User is not associated with any hospital.' 
    });
  }

  // Attach hospital filter to request for use in controllers
  req.hospitalFilter = req.user.hospitalId;
  next();
};

/**
 * Check if user owns the resource or has admin privileges
 */
export const ownerOrAdmin = (req, res, next) => {
  const resourceUserId = parseInt(req.params.userId || req.body.userId);
  const currentUserId = req.user.id;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

  if (resourceUserId === currentUserId || isAdmin) {
    return next();
  }

  return res.status(403).json({ 
    success: false,
    message: 'Access denied. You can only access your own resources.' 
  });
};
