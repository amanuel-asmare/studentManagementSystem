const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Check if user has one of the allowed roles
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Unauthorized: Insufficient role permissions' });
            }

            next();
        } catch (error) {
            res.status(401).json({ message: 'Invalid or expired token' });
        }
    };
};

module.exports = authMiddleware;