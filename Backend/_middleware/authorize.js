require('dotenv').config();
const { expressjwt: jwt } = require('express-jwt');
const db = require('../_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    // Authenticate JWT token and attach user to request object (req.auth)
    jwt({ 
      secret: process.env.JWT_SECRET || 'your-secret-key', 
      algorithms: ['HS256'], 
      requestProperty: 'auth',
      credentialsRequired: true
    }),

    // Debugging: Log token data
    (req, res, next) => {
      console.log('Authorization check - User:', req.auth);
      if (!req.auth) {
        return res.status(401).json({ message: 'JWT token missing or invalid' });
      }
      next();
    },

    // Authorize user role
    async (req, res, next) => {
      try {
        console.log('Checking account for:', req.auth.id);
        console.log('Required roles:', roles);

        const account = await db.Account.findByPk(req.auth.id);
        console.log('Account found:', account?.dataValues || 'Not found');

        if (!account) {
          console.log('Account not found');
          return res.status(401).json({ message: 'Account not found' });
        }

        if (roles.length && !roles.includes(account.role)) {
          console.log('Role mismatch. User role:', account.role, 'Required roles:', roles);
          return res.status(403).json({ 
            message: 'Unauthorized - Insufficient permissions',
            requiredRoles: roles,
            userRole: account.role
          });
        }

        req.auth.role = account.role;
        
        // Check if getRefreshTokens exists before calling it
        if (typeof account.getRefreshTokens === 'function') {
          const refreshTokens = await account.getRefreshTokens();
          req.auth.ownsToken = token => !!refreshTokens.find(x => x.token === token);
        } else {
          req.auth.ownsToken = () => true;
        }

        req.user = req.auth;
        next();
      } catch (error) {
        console.error('Authorization error:', error);
        return res.status(500).json({ 
          message: 'Internal server error during authorization',
          error: error.message 
        });
      }
    }
  ];
}