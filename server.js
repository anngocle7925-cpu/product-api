// Fix triệt để lỗi "crypto is not defined" từ Mongoose / BSON ở phạm vi toàn cục
const crypto = require('crypto');
if (!globalThis.crypto) {
    globalThis.crypto = crypto;
}

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Middleware
app.use(express.json());
app.use(cors());

// Kết nối cơ sở dữ liệu MongoDB qua biến môi trường .env
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Kết nối thành công đến MongoDB!'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Định nghĩa Schema & Model cho Product (pid, pname, price, quantity)
const productSchema = new mongoose.Schema({
    pid: { type: String, required: true, unique: true },
    pname: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// ==================== CÁC API CRUD ====================

// 1. Lấy tất cả sản phẩm (GET)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Lấy chi tiết sản phẩm theo pid (GET)
app.get('/api/products/:pid', async (req, res) => {
    try {
        const product = await Product.findOne({ pid: req.params.pid });
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Thêm mới sản phẩm (POST)
app.post('/api/products', async (req, res) => {
    try {
        const { pid, pname, price, quantity } = req.body;
        const newProduct = new Product({ pid, pname, price, quantity });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 4. Cập nhật thông tin sản phẩm theo pid (PUT)
app.put('/api/products/:pid', async (req, res) => {
    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { pid: req.params.pid },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedProduct) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 5. Xóa sản phẩm theo pid (DELETE)
app.delete('/api/products/:pid', async (req, res) => {
    try {
        const deletedProduct = await Product.findOneAndDelete({ pid: req.params.pid });
        if (!deletedProduct) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        res.status(200).json({ message: 'Đã xóa sản phẩm thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Healthcheck dành cho Docker
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK - Healthy' });
});

// Khởi chạy Server
app.listen(PORT, () => {
    console.log(`🚀 Server RESTful API đang chạy tại http://localhost:${PORT}`);
});