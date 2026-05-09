const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, getProductBySlug,
  createProduct, updateProduct, deleteProduct, addReview,
  getCategories, createCategory, updateCategory, deleteCategory
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public product routes
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProduct);

// Protected routes
router.post('/:id/review', protect, restrictTo('customer'), addReview);

// Admin-only routes
router.post('/', protect, restrictTo('admin'), upload.array('images', 5), createProduct);
router.put('/:id', protect, restrictTo('admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

module.exports = router;
