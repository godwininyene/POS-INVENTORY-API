const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    cashier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sales must belong to a cashier']
    },
    customer: {
        type: String,
        // required: [true, 'Please provide customer name'],
        trim: true,
        default:'Walk-in customer'
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Please provide product reference']
        },
        name: {
            type: String,
            required: [true, 'Please provide product name']
        },
        price: {
            type: Number,
            required: [true, 'Please provide product price'],
            min: [0, 'Price cannot be negative']
        },
        quantity: {
            type: Number,
            required: [true, 'Please provide product quantity'],
            min: [1, 'Quantity must be at least 1']
        },
        total: {
            type: Number,
            required: [true, 'Please provide item subtotal'],
            min: [0, 'Subtotal cannot be negative']
        },
        coverImage:{
            type:String,
            required:[true, 'Please provide product cover image']
        }
    }],
    subtotal: {
        type: Number,
        required: [true, 'Please provide subtotal amount'],
        min: [0, 'Subtotal cannot be negative']
    },
    tax: {
        type: Number,
        required: [true, 'Please provide tax amount'],
        min: [0, 'Tax cannot be negative']
    },
    totalAmount: {
        type: Number,
        required: [true, 'Please provide total amount'],
        min: [0, 'Total amount cannot be negative']
    },
    paymentMethod: {
        type: String,
        required: [true, 'Please provide payment method'],
        enum: {
            values: ['cash', 'card', 'mobile money', 'bank transfer'],
            message: 'Payment method must be one of: cash, card, mobile money, bank transfer'
        }
    },
    amountPaid: {
        type: Number,
        required: [true, 'Please provide amount paid'],
        min: [0, 'Amount paid cannot be negative'],
        validate: {
            validator: function (value) {
                return value >= this.totalAmount;
            },
            message: 'Amount paid must be greater than or equal to total amount'
        }
    },
    change: {
        type: Number,
        required: [true, 'Please provide change amount'],
        min: [0, 'Change cannot be negative']
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Pre-save middleware to calculate change if not provided
saleSchema.pre('save', function (next) {
    if (this.amountPaid && this.totalAmount) {
        this.change = this.amountPaid - this.totalAmount;
    }
    next();
});

// Instance method to validate payment
saleSchema.methods.isPaymentValid = function () {
    return this.amountPaid >= this.totalAmount;
};

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;