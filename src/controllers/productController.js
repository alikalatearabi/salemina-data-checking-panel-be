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

const getProductsByUserGroupedByStatus = async (req, res) => {
    try {
        const { username } = req.params;
        
        if (!username) {
            return res.status(400).json({ message: 'نام کاربری الزامی است.' });
        }

        // Get all products for this user (where importer = username)
        const products = await Product.find({ importer: username });
        
        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'هیچ محصولی برای این کاربر یافت نشد.' });
        }
        
        // Group products by main_data_status, extra_data_status, and date
        const groupedByStatus = {};
        const dailyCounts = {};
        
        products.forEach(product => {
            const mainStatus = product.main_data_status;
            const extraStatus = product.extra_data_status || 'undefined';
            
            // Create key format for status groups
            const statusKey = `${mainStatus}_${extraStatus}`;
            
            // Get date from createdAt or updatedAt with safe handling
            let dateKey = 'unknown-date';
            try {
                // Try createdAt first, fall back to updatedAt
                const dateToUse = product.createdAt || product.updatedAt;
                
                if (dateToUse && !isNaN(new Date(dateToUse).getTime())) {
                    const date = new Date(dateToUse);
                    dateKey = date.toISOString().split('T')[0]; // format as YYYY-MM-DD
                }
            } catch (err) {
                console.warn(`Invalid date for product ${product._id || product.barcode}: ${err.message}`);
            }
            
            // Initialize status group if it doesn't exist
            if (!groupedByStatus[statusKey]) {
                groupedByStatus[statusKey] = {
                    main_data_status: mainStatus,
                    extra_data_status: extraStatus,
                    totalCount: 0,
                    dailyCounts: {}
                };
            }
            
            // Initialize date for this status if it doesn't exist
            if (!groupedByStatus[statusKey].dailyCounts[dateKey]) {
                groupedByStatus[statusKey].dailyCounts[dateKey] = 0;
            }
            
            // Increment counts
            groupedByStatus[statusKey].totalCount += 1;
            groupedByStatus[statusKey].dailyCounts[dateKey] += 1;
            
            // Also track overall daily counts
            if (!dailyCounts[dateKey]) {
                dailyCounts[dateKey] = 0;
            }
            dailyCounts[dateKey] += 1;
        });
        
        // Convert dailyCounts objects to arrays for easier consumption
        Object.keys(groupedByStatus).forEach(key => {
            const dailyCountsObj = groupedByStatus[key].dailyCounts;
            groupedByStatus[key].dailyCounts = Object.keys(dailyCountsObj)
                .sort() // Sort by date
                .map(date => ({
                    date,
                    count: dailyCountsObj[date]
                }));
        });
        
        // Convert to array
        const statusGroups = Object.values(groupedByStatus);
        
        // Convert overall dailyCounts to array
        const overallDailyCounts = Object.keys(dailyCounts)
            .sort()
            .map(date => ({
                date,
                count: dailyCounts[date]
            }));
        
        res.status(200).json({
            username,
            totalProducts: products.length,
            statusGroups,
            overallDailyCounts
        });
        
    } catch (error) {
        console.error('Error fetching user products:', error);
        res.status(500).json({ message: 'خطا در دریافت اطلاعات محصولات.', error: error.message });
    }
};

module.exports = {
    getProducts,
    updateProduct,
    getDistinctClusters,
    getDistinctChildClusters,
    getDistinctClustersWithChildren,
    getProductsByUserGroupedByStatus
};
