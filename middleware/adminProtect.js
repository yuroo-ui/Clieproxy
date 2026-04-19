const { adminMiddleware } = require('../lib/auth');
const isAdmin = adminMiddleware;
module.exports = { isAdmin };
