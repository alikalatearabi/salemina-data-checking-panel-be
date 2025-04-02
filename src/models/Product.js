const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    main_data_status: { type: Number, required: true },
    extra_data_status: { type: String },
    importer: { type: String },
    monitor: { type: String, required: true },
    cluster: { type: String },
    child_cluster: { type: String },
    product_name: { type: String, required: true },
    brand: { type: String, required: true },
    picture_old: { type: String },
    picture_new: { type: String },
    picture_main_info: { type: String },
    picture_extra_info: { type: String },
    product_description: { type: String },
    barcode: { type: Number, unique: true, required: true },
    state_of_matter: { type: Number },
    per: { type: Number },
    calorie: { type: Number },
    sugar: { type: Number },
    fat: { type: Number },
    salt: { type: Number },
    trans_fatty_acids: { type: Number },
    per_ext: { type: String },
    calorie_ext: { type: String },
    cal_fat: { type: String },
    total_fat: { type: String },
    saturated_fat: { type: String },
    unsaturated_fat: { type: String },
    trans_fat: { type: String },
    protein: { type: String },
    sugar_ext: { type: String },
    carbohydrate: { type: String },
    fiber: { type: String },
    salt_ext: { type: String },
    sodium: { type: String },
    cholesterol: { type: String }
}, { timestamps: true });


module.exports = mongoose.model('Product', productSchema, 'products_data');
