const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    cart: {
        items: [{
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }]
    },

    resetToken: {
        type: String
    },

    resetTokenExpiration: {
        type: Date
    }


});

userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(p => {
        return p.productId.toString() === product._id.toString()
    })

    let newQuantity = 1;

    if (cartProductIndex >= 0) {
        this.cart.items[cartProductIndex].quantity += newQuantity;
    } else {
        this.cart.items.push({
            productId: product._id,
            quantity: newQuantity
        });
    }
    const updatedCart = {
        items: this.cart.items
    }
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.deleteCartItem = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString()
    });

    this.cart.items = updatedCartItems;
    return this.save();

}

//clear cart when content is ordered
userSchema.methods.clearCart = function() {
    this.cart = { items: [] };
    return this.save();
}












// userSchema.methods.getCart = function(products) {
//     return products.map(prod => {
//         return {
//             ...prod,
//             quantity: this.cart.items.find(p => {
//                 return p.productId.toString() === prod._id.toString();
//             }).quantity
//         }
//     });

// }

const user = mongoose.model('User', userSchema);

module.exports = user;