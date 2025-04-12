const express = require('express');
const router = express.Router();
const {
    getProducts,
    updateProduct,
    getDistinctClusters,
    getDistinctChildClusters,
    getDistinctClustersWithChildren,
    getProductsByUserGroupedByStatus,
    getDistinctImporters
} = require('../controllers/productController');

router.get('/products', getProducts);
router.put('/product/:barcode', updateProduct)
router.get('/distinct-clusters', getDistinctClusters);
router.get('/distinct-child-clusters', getDistinctChildClusters);
router.get('/distinct-clusters-and-children', getDistinctClustersWithChildren);
router.get('/user-products/:username', getProductsByUserGroupedByStatus);
router.get('/distinct-importers', getDistinctImporters);

module.exports = router;
