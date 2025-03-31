var express = require('express');
var router = express.Router();
let productSchema = require('../schemas/product');
let categorySchema = require('../schemas/category');
let { checkRole } = require('../middlewares/auth'); // Middleware kiểm tra quyền

function BuildQuery(query) {
  let result = {};
  if (query.name) {
    result.name = new RegExp(query.name, 'i');
  }
  result.price = { $gte: 0, $lte: 10000 };
  if (query.price) {
    if (query.price.$gte) {
      result.price.$gte = Number(query.price.$gte);
    }
    if (query.price.$lte) {
      result.price.$lte = Number(query.price.$lte);
    }
  }
  return result;
}

// Lấy danh sách sản phẩm (không yêu cầu đăng nhập)
router.get('/', async function (req, res, next) {
  let products = await productSchema.find(BuildQuery(req.query)).populate({ path: 'category', select: 'name' });
  res.status(200).send({ success: true, data: products });
});

// Lấy chi tiết sản phẩm theo ID (không yêu cầu đăng nhập)
router.get('/:id', async function (req, res, next) {
  try {
    let product = await productSchema.findById(req.params.id);
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// Tạo sản phẩm (chỉ mod có quyền)
router.post('/', checkRole('mod'), async function (req, res, next) {
  try {
    let body = req.body;
    let getCategory = await categorySchema.findOne({ name: body.category });
    if (getCategory) {
      let newProduct = new productSchema({
        name: body.name,
        price: body.price || 0,
        quantity: body.quantity || 0,
        category: getCategory._id,
      });
      await newProduct.save();
      res.status(200).send({ success: true, data: newProduct });
    } else {
      res.status(404).send({ success: false, message: 'category sai' });
    }
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// Cập nhật sản phẩm (chỉ mod có quyền)
router.put('/:id', checkRole('mod'), async function (req, res, next) {
  try {
    let product = await productSchema.findById(req.params.id);
    if (product) {
      Object.assign(product, req.body);
      await product.save();
      res.status(200).send({ success: true, data: product });
    } else {
      res.status(404).send({ success: false, message: 'ID không tồn tại' });
    }
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// Xóa sản phẩm (chỉ admin có quyền)
router.delete('/:id', checkRole('admin'), async function (req, res, next) {
  try {
    let product = await productSchema.findById(req.params.id);
    if (product) {
      product.isDeleted = true;
      await product.save();
      res.status(200).send({ success: true, data: product });
    } else {
      res.status(404).send({ success: false, message: 'ID không tồn tại' });
    }
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

module.exports = router;
