const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    imageUrl: {
        type: String,
        required: true
    },

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;



















// const sequelize = require('../util/database');

// const Sequelize = require('sequelize');

// const Product = sequelize.define('product', {
//     id: {
//         type: Sequelize.INTEGER.UNSIGNED,
//         primaryKey: true,
//         allowNull: false,
//         unique: true,
//         autoIncrement: true
//     },
//     title: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     price: {
//         type: Sequelize.DOUBLE,
//         allowNull: false
//     },
//     description: {
//         type: Sequelize.TEXT,
//         allowNull: false
//     },
//     imageUrl: {
//         type: Sequelize.STRING,
//         allowNull: false
//     }
// });

// module.exports = Product