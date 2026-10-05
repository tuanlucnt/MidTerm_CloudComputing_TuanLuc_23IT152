require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const MSSV = "23IT152"; 

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: true }));

// Đa luồng kết nối
const readConn = mongoose.createConnection(process.env.READ_DB_URI);
const writeConn = mongoose.createConnection(process.env.WRITE_DB_URI);

const ProductSchema = new mongoose.Schema({
    code: String,
    name: String,
    price: Number,
    priceWithVAT: Number
});

// Điều hướng luồng truy vấn
const ProductRead = readConn.model('Product', ProductSchema);
const ProductWrite = writeConn.model('Product', ProductSchema);

app.get('/', async (req, res) => {
    // Chỉ dùng tài khoản Đọc
    const products = await ProductRead.find().lean();
    const vatRate = parseInt(MSSV.slice(-1)) + 5;
    res.render('index', { products, MSSV, name: "Tên Của Bạn", vatRate });
});

app.post('/add', async (req, res) => {
    const { code, name, price } = req.body;
    
    // Cài đặt bộ lọc dữ liệu
    const prefix = MSSV.slice(-3);
    if (!code.startsWith(prefix)) {
        return res.send(`Lỗi: Mã sản phẩm phải bắt đầu bằng ${prefix}`);
    }

    // Tính thuế VAT động
    const vatRate = parseInt(MSSV.slice(-1)) + 5;
    const priceWithVAT = parseFloat(price) * (1 + vatRate / 100);

    // Chỉ dùng tài khoản Ghi
    const newProduct = new ProductWrite({ code, name, price, priceWithVAT });
    await newProduct.save();
    res.redirect('/');
});

app.listen(process.env.PORT || 3000, () => console.log('Server is running...'));