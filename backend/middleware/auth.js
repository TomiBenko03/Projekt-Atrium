// middleware/auth.js
const authMiddleware = (req, res, next) => {
    if (!req.session || !req.session.agentId) {
        return res.status(401).json({ message: 'Please login first' });
    }
    next();
};

module.exports = authMiddleware;