const express = require('express');
const router = express.Router();
const {
    getProducts,
    updateProduct,
    getDistinctClusters,
    getDistinctChildClusters,
    getDistinctClustersWithChildren,
} = require('../controllers/productController');

router.get('/products', getProducts);
router.put('/product/:barcode', updateProduct)
router.get('/distinct-clusters', getDistinctClusters);
router.get('/distinct-child-clusters', getDistinctChildClusters);
router.get('/distinct-clusters-and-children', getDistinctClustersWithChildren);

module.exports = router;
