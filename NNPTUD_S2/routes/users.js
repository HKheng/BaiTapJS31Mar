var express = require('express');
var router = express.Router();
var userControllers = require('../controllers/users');
const { check_authentication, check_authorization } = require("../utils/check_auth");
const constants = require('../utils/constants');

/* GET all users (chỉ mod, admin) */
router.get('/', check_authentication, check_authorization(['mod', 'admin']), async function (req, res, next) {
  try {
    let users = await userControllers.getAllUsers();
    res.send({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

/* GET user by ID (chỉ mod, admin - không lấy chính mình) */
router.get('/:id', check_authentication, check_authorization(['mod', 'admin']), async function (req, res, next) {
  try {
    if (req.user.id === req.params.id) {
      return res.status(403).json({ success: false, message: "You cannot access your own data!" });
    }

    let user = await userControllers.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

/* CREATE user (chỉ admin) */
router.post('/', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let body = req.body;
    let newUser = await userControllers.createAnUser(body.username, body.password, body.email, body.role);
    res.status(201).json({ success: true, message: newUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/* UPDATE user (chỉ admin) */
router.put('/:id', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let updatedUser = await userControllers.updateAnUser(req.params.id, req.body);
    res.status(200).json({ success: true, message: updatedUser });
  } catch (error) {
    next(error);
  }
});

/* DELETE user (chỉ admin) */
router.delete('/:id', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let deleteUser = await userControllers.deleteAnUser(req.params.id);
    res.status(200).json({ success: true, message: deleteUser });
  } catch (error) {
    next(error);
  }
});

module.exports = router;