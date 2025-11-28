const express = require('express');
const router = express.Router();
const cartController = require('./../controllers/cartController');
const authController = require('./../controllers/authController');


// Protect all routes below
router.use(authController.protect);
router.route('/')
    .post(cartController.addToCart)
    .get(cartController.getCart)

router.route('/:cartId/item/:productId')
    .patch( cartController.updateQuantity)
    .delete(cartController.removeCartItem)
router.delete('/:cartId/clear', cartController.clearCart)



module.exports = router;