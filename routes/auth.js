var express = require("express");
var router = express.Router();
let userController = require('../controllers/users')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let fs = require('fs');
const { CheckLogin } = require("../utils/authHandler");

router.post('/register', async function (req, res, next) {
    try {
        let { username, password, email } = req.body;

        // Hash the password before saving
        const hashedPassword = bcrypt.hashSync(password, 10);
        console.log('Registering user with username:', username);
        console.log('Plain Password:', password);
        console.log('Hashed Password:', hashedPassword);

        let newUser = await userController.CreateAnUser(
            username, hashedPassword, email, "69b0ddec842e41e8160132b8"
        );

        console.log('User successfully registered:', newUser);
        res.send(newUser);
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(404).send(error.message);
    }

})
// Add logging to verify user retrieval
router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        console.log('Attempting login for username:', username);

        let user = await userController.GetAnUserByUsername(username);
        if (!user) {
            console.log('User not found for username:', username);
            return res.status(404).send({
                message: "Invalid login credentials."
            });
        }

        console.log('Retrieved user from database:', user);
        console.log('Stored Hashed Password:', user.password);

        if (user.lockTime > Date.now()) {
            console.log('User is locked until:', new Date(user.lockTime));
            return res.status(403).send({
                message: "Your account is locked. Please try again later."
            });
        }

        // Compare the input password with the hashed password in the database
        console.log('Input Password:', password);
        const isMatch = bcrypt.compareSync(password, user.password);
        console.log('Password Match Result:', isMatch);

        if (isMatch) {
            user.loginCount = 0; // Reset login attempts on successful login
            await user.save();

            let token = jwt.sign({
                id: user._id
            }, privateKey, {
                algorithm: 'RS256',
                expiresIn: '1h'
            });

            console.log('Login successful. Token generated:', token);
            return res.status(200).send({ token });
        } else {
            user.loginCount++;
            console.log('Login attempt failed. Current login count:', user.loginCount);

            if (user.loginCount >= 3) {
                user.loginCount = 0;
                user.lockTime = Date.now() + 3600 * 1000; // Lock account for 1 hour
                console.log('User locked until:', new Date(user.lockTime));
            }

            await user.save();
            return res.status(401).send({
                message: "Invalid login credentials."
            });
        }
    } catch (error) {
        console.error('Error during login:', error.message);
        return res.status(500).send({
            message: "An error occurred during login. Please try again later."
        });
    }

})
router.get('/me',CheckLogin,function(req,res,next){
    console.log('Request Headers:', req.headers);
    console.log('Authorization Header:', req.headers.authorization);
    res.send(req.user)
})

router.post('/changepassword', CheckLogin, async function (req, res, next) {
    try {
        const { oldpassword, newpassword } = req.body;

        // Validate new password
        if (!newpassword || newpassword.length < 8) {
            return res.status(400).send({ message: "New password must be at least 8 characters long." });
        }

        const user = req.user; // Retrieved from CheckLogin middleware

        // Verify old password
        if (!bcrypt.compareSync(oldpassword, user.password)) {
            return res.status(400).send({ message: "Old password is incorrect." });
        }

        // Hash the new password
        const hashedPassword = bcrypt.hashSync(newpassword, 10);
        console.log('Old Password:', oldpassword);
        console.log('New Password:', newpassword);
        console.log('Hashed Password:', hashedPassword);
        user.password = hashedPassword;
        await user.save();

        res.status(200).send({ message: "Password changed successfully." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Update JWT signing to use RS256
const privateKey = fs.readFileSync('private.key', 'utf8');
const publicKey = fs.readFileSync('public.key', 'utf8');

module.exports = router;