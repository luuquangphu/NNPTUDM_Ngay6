const fs = require('fs');
const jwt = require('jsonwebtoken');
const userController = require('../controllers/users');

// Đọc public key để xác minh token
const publicKey = fs.readFileSync('public.key', 'utf8');

const CheckLogin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({ message: 'ban chua dang nhap' });
        }

        const token = authHeader.split(' ')[1]; // Lấy token từ header
        const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] }); // Xác minh token

        // Lấy thông tin người dùng từ cơ sở dữ liệu
        const user = await userController.GetAnUserById(decoded.id);
        if (!user) {
            return res.status(401).send({ message: 'ban chua dang nhap' });
        }

        req.user = user; // Gắn thông tin người dùng vào req.user
        next();
    } catch (error) {
        console.error('Error in CheckLogin:', error.message);
        return res.status(401).send({ message: 'ban chua dang nhap' });
    }
};

module.exports = { CheckLogin };