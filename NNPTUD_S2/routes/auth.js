var express = require('express');
var router = express.Router();
let userControllers = require('../controllers/users');
let { check_authentication } = require("../utils/check_auth");
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');

// Đăng nhập
router.post('/login', async function (req, res, next) {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let result = await userControllers.checkLogin(username, password);
        res.status(200).send({
            success: true,
            data: jwt.sign({
                id: result,
                expireIn: (new Date(Date.now() + 3600 * 1000)).getTime()
            }, constants.SECRET_KEY)
        });
    } catch (error) {
        next(error);
    }
});

// Đăng ký
router.post('/signup', async function (req, res, next) {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let email = req.body.email;
        let result = await userControllers.createAnUser(username, password, email, 'user');
        res.status(200).send({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Lấy thông tin cá nhân (yêu cầu đăng nhập)
router.get('/me', check_authentication, async function (req, res, next) {
    try {
        res.send({
            success: true,
            data: req.user
        });
    } catch (error) {
        next(error);
    }
});

// Đổi mật khẩu (yêu cầu đăng nhập)
router.post('/changepassword', check_authentication, async function (req, res, next) {
    try {
        let oldpassword = req.body.oldpassword;
        let newpassword = req.body.newpassword;
        let user = await userControllers.changePassword(req.user, oldpassword, newpassword);
        res.send({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
