const express = require('express');
const router = express.Router();
const saleController = require('./../controllers/saleController');
const authController = require('./../controllers/authController');



// Protect all routes below
router.use(authController.protect);
router.route('/')
    .post(saleController.checkout)
    .get(saleController.getAllSales)
 

router.route('/:saleId')
    .get(saleController.getSaleDetails)
    // .delete(cartController.removeCartItem)




module.exports = router;