const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes (chỉ giữ auth và dashboard)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));  // Thêm dòng này
app.use('/api/users', require('./routes/userRoutes')); 
app.use('/api/profile', require('./routes/profileRoutes')); 

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'HRMS API is running' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Lỗi server' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});

module.exports = app;