const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path')
const PdfDocument = require('pdfkit');
const ITEMS_PER_PAGE = 1;
//const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    let page = +req.query.page || 1;    
    let totalItems;
    Product.find()
        .countDocuments()
        .then(numProducts => {
           // console.log(numProducts)
           totalItems = numProducts;
            return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
        })   
        .then((products) => {
           // console.log(products);
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'products', 
                path: '/products', 
                hasNextPage: page * ITEMS_PER_PAGE < totalItems,
                hasPreviousPage: page > 1,
                currentPage: page,
                previousPage: page - 1,
                nextPage: page + 1,
                lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
            });
        })
        .catch(err => next(new Error(err)));
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((row) => {
            //console.log(row);
            res.render('shop/product-detail', {
                product: row,
                pageTitle: row.title,
                path: '/products'
            });
        })
        .catch(err => {
            const error = new Error(err); // error.message property holds the argument passed
            error.statusCode = 500;
            return next(error); //rap the error object in the next() for thrown errors coming from asynchronous func in order to reach error handling middleware
        });
};


exports.getIndex = (req, res, next) => {
    let page = parseInt(req.query.page) || 1;  // +req.query.page
    
    let totalItems;
    Product.find()
        .countDocuments()
        .then(numProducts => {
           // console.log(numProducts)
           totalItems = numProducts;
            return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
        })   
        .then((products) => {
           // console.log(products);
            res.render('shop/index', {
                prods: products,
                pageTitle: 'shop',
                path: '/', 
                hasNextPage: page * ITEMS_PER_PAGE < totalItems,
                hasPreviousPage: page > 1,
                currentPage: page,
                previousPage: page - 1,
                nextPage: page + 1,
                lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err); // error.message property holds the argument passed
            error.statusCode = 500;
            return next(error); //rap the error object in the next() for thrown errors coming from asynchronous func in order to reach error handliding middleware
        });              
};

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(cartProducts => {
            //-console.log(cartProducts.cart.items)
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: cartProducts.cart.items
            });
        })
        .catch(err => {
            const error = new Error(err); // error.message property holds the argument passed
            error.statusCode = 500;
            return next(error); //rap the error object in the next() for thrown errors coming from asynchronous func in order to reach error handliding middleware
        });
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            //console.log(req.user);
            return req.user.addToCart(product)
        })
        .then(result => {
            //console.log(result)
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err); // error.message property holds the argument passed
            error.statusCode = 500;
            return next(error); //rap the error object in the next() for thrown errors coming from asynchronous func in order to reach error handliding middleware
        });

};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.deleteCartItem(prodId)
        .then(result => {
            //console.log(result)
            res.redirect('/cart');
        });
};

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            //console.log(orders)
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders
            });
        })

};


exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            // console.log(user.cart.items)
            const products = user.cart.items.map(i => {
                    //console.log(i.productId)
                    return { quantity: i.quantity, product: i.productId._doc } //._doc to add all d product info rather dan d product id
                })
                //console.log(products)
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            })
            return order.save()
        })
        .then(result => {
            // req.user.cart.items = [];
            // req.user.save();
            //res.redirect('/order');  OR 

            console.log(result)
            return req.user.clearCart();
        })
        .then(result => {
            //console.log(result);
            res.redirect('/orders');
        })
        .catch(err => {
            const error = new Error(err); // error.message property holds the argument passed
            error.statusCode = 500;
            return next(error); //rap the error object in the next() for thrown errors coming from asynchronous func in order to reach error handliding middleware
        })
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    const invoiceName = `${orderId}-invoice.pdf`; 
    const invoicePath = path.join('data', 'invoice', invoiceName) 
    const pdfDoc = new PdfDocument();

    Order.findById(orderId)
      .then(order => {
          //console.log(order)
          if(!order){
              return next(new Error('Order not found'))
          }
          if(order.user.userId.toString() !== req.user._id.toString()){
              return next(new Error('Unauthorize Access'));
          }
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename=${orderId}-invoice.pdf`);
          pdfDoc.pipe(fs.createWriteStream(invoicePath));
          pdfDoc.pipe(res);
          pdfDoc.text('Invoice');
          pdfDoc.text('-----------------------------------');
          pdfDoc.text(`Order ID: ${orderId}, Date: ${new Date().toDateString()}`);
          pdfDoc.text('-----------------------------------');
          let totalPrice = 0;
          for(prod of order.products){
              totalPrice += prod.quantity * prod.product.price;
              pdfDoc.text('Product Name: ' + prod.product.title + ', Price: N' + prod.product.price  + ', Quantity: ' + prod.quantity);
          }         
          pdfDoc.text('-----------------------------------');
          pdfDoc.text('Total Price =  N' + totalPrice)
          //pdfDoc.text('Thanks for the order');
          pdfDoc.end();
      })
      .catch(err => {
        next(new Error(err))
    })

   
    
}