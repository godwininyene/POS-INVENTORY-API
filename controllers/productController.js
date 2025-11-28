const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Product = require('./../models/product');

exports.createProduct = catchAsync(async (req, res, next) => {
    // Cloudinary URL is now available in req.file.path
    if (req.file) {
        req.body.coverImage = req.file.path; // Cloudinary URL
    }
    const product = await Product.create(req.body)

    res.status(201).json({
        status: "success",
        data: {
            product
        }
    })
})

exports.getAllProducts = catchAsync(async (req, res, next) => {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({
        status: "success",
        result: products.length,
        data: {
            products
        }
    })
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    // Cloudinary URL is now available in req.file.path
    if (req.file) {
        req.body.coverImage = req.file.path; // Cloudinary URL
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body,
        {
            runValidators: true,
            new: true
        }
    )

    if (!product) {
        return next(new AppError('No product was found with that ID', '', 404))
    }

    res.status(200).json({
        status: "success",
        data: {
            product
        }
    })
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return next(new AppError('No product was found with that ID', '', 404))
    }
    res.status(204).json({
        data: null
    })
})