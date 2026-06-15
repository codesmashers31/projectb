import express from 'express';
import { getAllUsers, toggleUserStatus } from '../controllers/userAdminController.js';
import { authenticateToken } from '../controllers/authController.js';

const router = express.Router();

// Strict Admin Authorization Middleware (Phase 5.2)
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.userType === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }
};

// Protect all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getAllUsers);
router.put('/:id/status', toggleUserStatus);

export default router;
