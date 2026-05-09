// Restrict route access to specific roles
// Usage: restrictTo('admin') or restrictTo('admin', 'worker')
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route is restricted to: ${roles.join(', ')}.`
      });
    }
    next();
  };
};

module.exports = { restrictTo };
