const mongoose = require('mongoose')
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Please provide product id']
  },
  name: {
    type: String,
    required: [true, 'Please provide product name']
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price']
  },
  coverImage:{
    type:String,
    required:[true, 'please provide product cover image']
  },  
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  total: {
    type: Number,
    required: [true, 'Please provide total amount']
  }
});

module.exports = cartItemSchema;
