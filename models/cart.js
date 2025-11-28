const mongoose = require('mongoose');
const cartItemSchema = require('./cartItem');

const cartSchema = new mongoose.Schema({
    items: [cartItemSchema],

    totalQuantity: {
        type: Number,
        default: 0
    },

    subtotal: {
        type: Number,
        default: 0
    },

    tax: {
        type: Number,
        default: 0
    },

    totalAmount: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ['open', 'completed', 'canceled'],
        default: 'open'
    },

    cashier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        default: null
    }
}, { timestamps: true });

cartSchema.methods.recalculateTotals = function () {
    let subtotal = 0;
    let totalQuantity = 0;

    this.items.forEach(item => {
        // Ensure price is valid number
        const price = Number(item.price) || 0;
        const qty = Number(item.quantity) || 0;

        item.total = price * qty;   // update each item's total

        subtotal += item.total;
        totalQuantity += qty;
    });

    this.subtotal = subtotal;
    this.totalQuantity = totalQuantity;

    // If you want to add tax (e.g., VAT 7.5%)
    this.tax = Number((subtotal * 0.075).toFixed(2));   // change rate if needed

    this.totalAmount = Number((subtotal + this.tax).toFixed(2));
};



const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
