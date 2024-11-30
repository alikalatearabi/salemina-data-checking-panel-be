const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');


const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', productRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


module.exports = app;