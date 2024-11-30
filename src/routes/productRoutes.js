const express = require('express');
const router = express.Router();
const { getProducts, updateProduct } = require('../controllers/productController');

router.get('/products', getProducts);
router.put('/product/:barcode', updateProduct)

module.exports = router;
