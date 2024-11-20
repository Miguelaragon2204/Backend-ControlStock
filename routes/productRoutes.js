const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { protect, admin, empleado } = require('../middleware/authMiddleware');

// Rutas para productos
router.post('/', protect, empleado, createProduct);
router.get('/', protect, getProducts);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;