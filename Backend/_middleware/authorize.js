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
    jwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'], requestProperty: 'auth' }),

    // Debugging: Log token data
    (req, res, next) => {
      console.log('Decoded User:', req.auth); // Should print valid token payload
      if (!req.auth) {
        return res.status(401).json({ message: 'JWT token missing or invalid' });
      }
      next();
    },

    // Authorize user role
    async (req, res, next) => {
      try {
        console.log('Checking account for:', req.auth.id);

        const account = await db.Account.findByPk(req.auth.id);
        console.log('Account found:', account?.dataValues || 'Not found');

        if (!account || (roles.length && !roles.includes(account.role))) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        req.auth.role = account.role;
        
        // Check if getRefreshTokens exists before calling it
        if (typeof account.getRefreshTokens === 'function') {
          const refreshTokens = await account.getRefreshTokens();
          req.auth.ownsToken = token => !!refreshTokens.find(x => x.token === token);
        } else {
          req.auth.ownsToken = () => true; // Default to true if no refresh tokens
        }

        req.user = req.auth; // Ensure `req.user` is available
        next();
      } catch (error) {
        console.error('Authorization error:', error);
        return res.status(500).json({ message: 'Internal server error during authorization' });
      }
    }
  ];
}