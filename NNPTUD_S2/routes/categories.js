var express = require("express");
var router = express.Router();
let categorySchema = require("../schemas/category");
let { checkRole } = require("../middlewares/auth"); // Middleware kiểm tra quyền

// Lấy danh sách category (không yêu cầu đăng nhập)
router.get("/", async function (req, res, next) {
  let categories = await categorySchema.find({});
  res.status(200).send({ success: true, data: categories });
});

// Lấy chi tiết category theo ID (không yêu cầu đăng nhập)
router.get("/:id", async function (req, res, next) {
  try {
    let category = await categorySchema.findById(req.params.id);
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// Tạo category (chỉ mod có quyền)
router.post("/", checkRole("mod"), async function (req, res, next) {
  try {
    let newCategory = new categorySchema({ name: req.body.name });
    await newCategory.save();
    res.status(200).send({ success: true, data: newCategory });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// Cập nhật category (chỉ mod có quyền)
router.put("/:id", checkRole("mod"), async function (req, res, next) {
  try {
    let category = await categorySchema.findById(req.params.id);
    if (category) {
      category.name = req.body.name || category.name;
      await category.save();
      res.status(200).send({ success: true, data: category });
    } else {
      res.status(404).send({ success: false, message: "ID không tồn tại" });
    }
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// Xóa category (chỉ admin có quyền)
router.delete("/:id", checkRole("admin"), async function (req, res, next) {
  try {
    let category = await categorySchema.findById(req.params.id);
    if (category) {
      category.isDeleted = true;
      await category.save();
      res.status(200).send({ success: true, data: category });
    } else {
      res.status(404).send({ success: false, message: "ID không tồn tại" });
    }
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

module.exports = router;
