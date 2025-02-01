const Product = require('../models/Product');

const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const startIndex = (page - 1) * limit;

        const filters = { ...req.query };
        delete filters.page;
        delete filters.limit;

        const query = {};
        for (const key in filters) {
            if (filters[key]) {
                query[key] = filters[key];
            }
        }

        const totalProducts = await Product.countDocuments(query);

        const products = await Product.find(query)
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            page,
            limit,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            data: products,
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { barcode } = req.params
        const updateData = req.body

        const updateProduct = await Product.findOneAndUpdate({ barcode }, updateData, {
            new: true,
            runValidators: true
        })

        if (!updateProduct) {
            return res.status(404).json({ message: 'محصول یافت نشد' })
        }

        res.json(updateProduct)

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server Error' })

    }
}

const getDistinctClusters = async (req, res) => {
    try {
        const clusters = await Product.distinct('cluster');
        res.status(200).json({ clusters });
    } catch (error) {
        console.error('Error fetching distinct clusters:', error);
        res.status(500).json({ message: 'خطا در دریافت لیست خوشه‌ها.' });
    }
};

const getDistinctChildClusters = async (req, res) => {
    const { cluster } = req.query;

    if (!cluster) {
        return res.status(400).json({ message: 'خوشه مورد نظر را انتخاب کنید.' });
    }

    try {
        const childClusters = await Product.distinct('child_cluster', { cluster });
        res.status(200).json({ childClusters });
    } catch (error) {
        console.error('Error fetching distinct child clusters:', error);
        res.status(500).json({ message: 'خطا در دریافت لیست زیر خوشه‌ها.' });
    }
};

const getDistinctClustersWithChildren = async (req, res) => {
    try {
        const clusters = await Product.distinct('cluster');

        const clustersWithChildren = await Promise.all(
            clusters.map(async (cluster) => {
                const childClusters = await Product.distinct('child_cluster', { cluster });
                return { cluster, childClusters };
            })
        );

        res.status(200).json({ clustersWithChildren });
    } catch (error) {
        console.error('Error fetching clusters and child clusters:', error);
        res.status(500).json({ message: 'خطا در دریافت لیست خوشه‌ها و زیر خوشه‌ها.' });
    }
};

module.exports = {
    getProducts,
    updateProduct,
    getDistinctClusters,
    getDistinctChildClusters,
    getDistinctClustersWithChildren
};
