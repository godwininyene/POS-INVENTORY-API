const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Cart = require('./../models/cart');
const Sale = require('./../models/sale');

exports.checkout = catchAsync(async (req, res, next) => {
    // const { cartId } = req.params;
    const { cartId, paymentMethod, amountPaid, customer } = req.body//amountPaid is optional;

    // 1. Get the cart
    const cart = await Cart.findById(cartId).populate("items.product");

    if (!cart) {
        return next(new AppError("Cart not found", '', 404));
    }

    if (cart.items.length === 0) {
        return next(new AppError("Cart is empty", '', 400));
    }

    if (cart.status !== "open") {
        return next(new AppError("Cart is already completed", '', 400));
    }

    // 2. Validate payment
    if (!paymentMethod) {
        return next(new AppError("Payment method is required", '', 400));
    }

    if (paymentMethod === "cash") {
        if (!amountPaid || amountPaid < cart.totalAmount) {
            return next(new AppError("Insufficient cash amount", '', 400));
        }
    }

    // 3. Reduce stock for each product
    for (let item of cart.items) {
        const product = item.product;

        if (product.quantity < item.quantity) {
            return next(new AppError(`Not enough stock for ${product.name}`, '', 400));
        }

        product.quantity -= item.quantity;
        await product.save();
    }

    // 4. Create Sale record
    const sale = await Sale.create({
        cashier: cart.cashier,
        customer: customer || 'Walk-in customer',
        items: cart.items.map(i => ({
            product: i.product._id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            total: i.total,
            coverImage: i.coverImage
        })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        totalAmount: cart.totalAmount,
        paymentMethod,
        amountPaid: amountPaid || cart.totalAmount,
        change: paymentMethod === "cash" ? amountPaid - cart.totalAmount : 0
    });

    // 5. Mark cart as completed
    cart.status = "completed";
    await Cart.findByIdAndDelete(cartId);

    // 6. Return receipt
    res.status(201).json({
        status: "success",
        // message: "Checkout successful",
        data: {
            sale,
            receipt: {
                saleId: sale._id,
                items: sale.items,
                subtotal: sale.subtotal,
                tax: sale.tax,
                total: sale.totalAmount,
                paymentMethod: sale.paymentMethod,
                amountPaid: sale.amountPaid,
                change: sale.change,
                cashier: sale.cashier,
                date: sale.createdAt
            }
        }
    });
});


exports.getAllSales = catchAsync(async (req, res, next) => {
    // Conditionally apply user filter
    const userCondition = req.user.role === 'admin' && req.query.user
        ? { user: req.query.user }
        : req.user.role !== 'admin'
            ? { cashier: req.user._id }
            : {}; // For admin with no filter, get all

    // Conditionally apply population
    const populateOptions = req.user.role === 'admin'
        ? { path: 'cashier', select: 'name' }
        : null;

    // Build query
    const query = Sale.find(userCondition).sort({ createdAt: -1 })
    query.select('-items')
    if (populateOptions) {
        query.populate(populateOptions);
    } else {
        // For non-admin users, exclude the cashier field entirely
        query.select('-cashier');
    }

    // Fetch all sales
    const sales = await query;
    res.status(200).json({
        status: 'success',
        results: sales.length,
        data: {
            sales
        }
    });
});

exports.getSaleDetails = catchAsync(async (req, res, next) => {
  const saleId = req.params.saleId; 
  
  // First, find the sale without any population
  const sale = await Sale.findById(saleId);
  
  // Check if sale exists
  if (!sale) {
    return next(new AppError('No sale record was found with that ID', '', 404));
  }
  
  // Authorization check
  if (req.user.role !== 'admin' && sale.cashier.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to view this sale','', 403));
  }
  
  // Now build the query for the populated sale based on user role
  let query = Sale.findById(saleId);
  
  if (req.user.role === 'admin') {
    // Admin can see cashier details
    query = query.populate({ path: 'cashier', select: 'name' });
  } else {
    // Non-admin users - exclude cashier field
    query = query.select('-cashier');
  }
  
  // Execute the query
  const populatedSale = await query;
  
  res.status(200).json({
    status: 'success',
    data: {
      sale: populatedSale
    }
  });
});
