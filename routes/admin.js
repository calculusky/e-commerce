const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const isAuth = require('../middlewares/isAuth');

const validation = require('../controllers/validation')

const router = express.Router();

// // /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product', validation.addProductValidator, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', validation.editProductValidator, adminController.postEditProduct);

router.delete('/product/:productId', adminController.deleteProduct);

module.exports = router;