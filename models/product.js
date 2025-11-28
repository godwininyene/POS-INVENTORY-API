const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
        unique: true
    },
    sku: {
        type: String,
        required: [true, 'Please provide product sku'],
        trim: true,
        unique: true
    },
    quantity:{
        type:Number,
        required:[true, 'Please provide stock quantity']
    },

    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        min: [0, 'Price cannot be negative'],
        validate: {
            validator: function (value) {
                return value.toString().length >= 2;
            },
            message: 'Price must be at least 2 digits'
        }
    },
    category: {
        type: String,
        required: [true, 'Please provide product category']
    },
    coverImage: {
        type: String,
        required: [true, 'Please provide product cover image']
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);


module.exports = Product