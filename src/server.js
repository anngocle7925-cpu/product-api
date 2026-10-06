require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/Product');

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    const dbOk = mongoose.connection.readyState === 1;
    res.status(dbOk ? 200 : 503).json({
        status: dbOk ? 'OK' : 'DB_DOWN',
        db: dbOk ? 'connected' : 'disconnected',
        uptime: process.uptime(),
    });
});

// Create
app.post('/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Read all
app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Read one
app.get('/products/:pid', async (req, res) => {
    const product = await Product.findOne({ pid: req.params.pid });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
});

// Update
app.put('/products/:pid', async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { pid: req.params.pid },
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ error: 'Not found' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete
app.delete('/products/:pid', async (req, res) => {
    const product = await Product.findOneAndDelete({ pid: req.params.pid });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', pid: req.params.pid });
});

const PORT = process.env.PORT || 3000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Product API running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });