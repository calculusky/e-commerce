const mongoose = require('mongoose');
const Schema = mongoose.Schema

const orderSchema = new Schema({

    user: {
        email: {
            type: String,
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    },

    products: [{
        product: { type: Object, required: true },
        quantity: { type: Number }
    }]


});

const order = mongoose.model('Order', orderSchema);
module.exports = order;