require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');

const app = express();

// Cấu hình lưu Session xuống Cloud MongoDB Atlas (Stateless)
const store = new MongoDBStore({
    uri: process.env.WRITE_DB_URI,
    collection: 'mySessions'
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store // Lưu session tập trung
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: true }));