const catchAsync = require("../utils/catchAsync");
const AppError = require('./../utils/appError')
const Product = require('./../models/product');
const Cart = require('./../models/cart');


// Add item to cart
exports.addToCart = catchAsync(async (req, res, next) => {
    const { productId, quantity = 1 } = req.body;
    // 1. Ensure product exists
    const product = await Product.findById(productId);
    if (!product) return next(new AppError("Product not found", '', 404));

    // 2. Get or create POS cart for this cashier
    let cart = await Cart.findOne({ cashier: req.user.id, status: 'open' });

    if (!cart) {
        cart = await Cart.create({ cashier: req.user.id, items: [] });
    }

    // 3. Look for existing item in cart
    const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
    );

    if (existingItem) {
        // Increase quantity
        existingItem.quantity += Number(quantity);
        existingItem.total = existingItem.quantity * existingItem.price;
    } else {
        // Add new item snapshot
        cart.items.push({
            product: productId,
            name: product.name,
            price: product.price,
            coverImage: product.coverImage,
            quantity,
            total: quantity * product.price
        });
    }

    // 4. Recalculate cart totals
    cart.totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    cart.subtotal = cart.items.reduce((sum, i) => sum + i.total, 0);
    cart.totalAmount = cart.subtotal; // If tax or discounts later, modify here

    // 5. Save cart
    await cart.save();

    res.status(201).json({
        status: "success",
        data: { cart }
    });
});

exports.getCart = catchAsync(async (req, res, next) => {
    const cashierId = req.user.id;

    // 1. Find cashier's active cart 
    let cart = await Cart.findOne({ cashier: cashierId, status: 'open' })

    // 2. If no cart exists, return empty structure
    if (!cart) {
        return res.status(200).json({
            status: "success",
            data: {
                items: [],
                summary: {
                    totalItems: 0,
                    subtotal: 0,
                    tax: 0,
                    total: 0
                }
            }
        });
    }

    // 3. Build summary
    const summary = {
        totalItems: cart.totalQuantity,
        subtotal: cart.subtotal,
        tax: cart.tax,
        total: cart.totalAmount
    };

    

    // 4. Return cart with product coverImage
    res.status(200).json({
        status: "success",
        result: cart.items.length,
        data: {
            cartId: cart._id,     
            items: cart.items,
            summary
        }
    });
});



// Update quantity of a cart item (Supermarket POS)
exports.updateQuantity = catchAsync(async (req, res, next) => {
    const { cartId, productId } = req.params;
    const { quantity } = req.body;

    // 1. Validate quantity
    if (!quantity || quantity < 1) {
        return next(new AppError("Quantity must be at least 1", '', 400));
    }

    // 2. Fetch cart WITHOUT populate
    const cart = await Cart.findById(cartId);
    if (!cart) {
        return next(new AppError("Cart not found", '', 404));
    }

    // 3. Find the item
    const item = cart.items.find(
        (i) => i.product.toString() === productId
    );

    if (!item) {
        return next(new AppError("Product not found in cart", '', 404));
    }

    // 4. Update quantity
    item.quantity += quantity;

    // 5. Update item total
    item.total = item.price * item.quantity;

    // 6. Recalculate totals
    cart.recalculateTotals();

    // 7. Save
    await cart.save();

    // 8. Return clean item
    const responseItem = {
        _id: item._id,
        product: item.product,      // ObjectId only
        name: item.name,
        price: item.price,
        coverImage: item.coverImage,
        quantity: item.quantity,
        total: item.total
    };

    res.status(200).json({
        status: "success",
        data: {
            item: responseItem,
            summary: {
                totalItems: cart.totalQuantity,
                subtotal: cart.subtotal,
                tax: cart.tax,
                total: cart.totalAmount
            }
        }
    });
});


// Remove item from cart (Supermarket POS)
exports.removeCartItem = catchAsync(async (req, res, next) => {
    const { cartId, productId } = req.params;

    // 1. Fetch the cart
    const cart = await Cart.findById(cartId).populate({
        path: "items.product",
    });

    if (!cart) {
        return next(new AppError("Cart not found", '', 404));
    }

    // 2. Find item index
    const itemIndex = cart.items.findIndex(
        (i) => i.product._id.toString() === productId
    );

    if (itemIndex === -1) {
        return next(new AppError("Product not found in cart", '', 404));
    }

    // 3. Remove item completely
    cart.items.splice(itemIndex, 1);

    // 4. Recalculate totals
    cart.recalculateTotals();

    // 5. Save cart
    await cart.save();

    res.status(200).json({
        status: "success",
        data: {
            summary: {
                subtotal: cart.subtotal,
                totalItems: cart.totalItems,
                tax: cart.tax,
                total: cart.total,
            }
        }
    });
});


// Clear the entire cart (Supermarket POS)
exports.clearCart = catchAsync(async (req, res, next) => {
    const { cartId } = req.params;

    // 1. Fetch the cart
    const cart = await Cart.findById(cartId);

    if (!cart) {
        return next(new AppError("Cart not found", '', 404));
    }

    // 2. If already empty
    if (!cart.items || cart.items.length === 0) {
        return res.status(200).json({
            status: "success",
            message: "Cart is already empty",
            data: {
                items: [],
                summary: {
                    totalItems: cart.totalQuantity,
                    subtotal: cart.subtotal,
                    tax: cart.tax,
                    total: cart.totalAmount
                }
            }
        });
    }

    // 3. Clear items
    cart.items = [];

    // 4. Reset fields based on your DB schema
    cart.totalQuantity = 0;
    cart.subtotal = 0;
    cart.tax = 0;
    cart.totalAmount = 0;

    // 5. Save updated cart
    await cart.save();

    res.status(200).json({
        status: "success",
        data: {
            items: [],
            summary: {
                totalItems: 0,
                subtotal: 0,
                tax: 0,
                total: 0
            }
        }
    });
});


