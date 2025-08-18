import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const auth = async (req, res, next) => {
    try {
        //get token from header
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided, authorisation denied'
            });
        }
        //Extract token (remove 'Bearer' prefix)
        const token = authHeader.substring(7);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided, authorization denied'
            })
        }

        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //Get user from token (exclude password)
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token is not valid',
            });
        }

        //Add user info to request object
        req.user = { userId: user._id, user };
        next();
    } catch (error) {
        if (error.name == 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export default { auth };