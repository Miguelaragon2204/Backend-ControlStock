const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUsers, 
  deleteUser,
  toggleSuspendUser,
  getUserProfile 
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteUser);
router.put("/:id/suspend", toggleSuspendUser);
router.get('/me', protect, getUserProfile);


module.exports = router;