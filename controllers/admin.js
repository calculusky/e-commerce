const Product = require('../models/product');
const { deleteImg } = require('../util/deleteImg');
const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        imageError: null,
        hasError: false,
        validationErrors: [],
        errorMessages: null
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const userId = req.user; // or req.user._id
    const error = validationResult(req);
    //console.log(error)
    console.log(image)

    //no image or image is undefined--------------------re-render page
    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            imageError: 'Attached file is not an image',
            errorMessages: error.array(),
            validationErrors: error.array(),
            product: {
                title: title,
                price: price,
                description: description
            }
        })
    }

    //if there is error in the user input during validation--------re-render page
    if (!error.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            imageError: false,
            hasError: true,
            errorMessages: error.array(),
            validationErrors: error.array(),
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            }
        });
    }

    //no errors and image is ok-------------------store in db

    const product = new Product({
        title,
        price,
        description,
        imageUrl: image.path,
        userId
    });
    product.save()
        .then(result => {
            //console.log(result);
            console.log('****values successfully inserted****')
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err)
            const error = new Error(err); // error.message property holds the argument passed
            error.statusCode = 500;
            //return next(error); //rap the error object in the next() for thrown errors coming from asynchronous func in order to reach error handliding middleware
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    //console.log(editMode) ---> true
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            // console.log(product.imageUrl)
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                hasError: false,
                imageError: false,
                product: product,
                validationErrors: [],
                errorMessages: null
            });
        });
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImage = req.file;
    const updatedDesc = req.body.description;
    const error = validationResult(req);
    //console.log(error);


    if (!error.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            errorMessages: error.array(), //for outputting errorrs
            validationErrors: error.array(), //for red border on the form
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDesc,
                _id: req.body.productId
            }
        })
    }
    Product.findById(prodId)
        .then(product => {
            // console.log(product.userId.toString());
            // console.log(req.user._id.toString());
            if(!product){
                return next(new Error('product not found'))
            }

            if (product.userId.toString() !== req.user._id.toString()) { //------- Authorization
                return res.redirect('/');
            }
            //update the product
            product.title = updatedTitle;
            if(updatedImage){
                console.log(product.imageUrl)
                deleteImg(product.imageUrl);
                product.imageUrl = updatedImage.path;
            }           
            product.description = updatedDesc;
            product.price = updatedPrice;
            return product.save(); //if no return keyword in this line, result ---> undefined ----also, we use return instead of chaining our promises thereby making it not to look like callbacks i.e product.save().then().catch()                   

        })
        .then(result => { //handles successful response from product.save() promise
            // console.log(result); //result ---> our data from db
            if (result) {
                res.redirect('/admin/products');
            }

        })
        .catch(err => {
            const error = new Error(err); // error.message property holds the argument passed
            error.statusCode = 500;
            return next(error); //rap the error object in the next() for thrown errors coming from asynchronous func in order to reach error handliding middleware
        });

};

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id }) //the user can see the products
        // .select('title price -_id')
        // .populate('userId', '-cart -name') //-name ---> exclude name and cart
        .then(products => {
            // console.log(products);
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => {
            const error = new Error(err); // error.message property holds the argument passed
            error.statusCode = 500;
            return next(error); //rap the error object in the next() for thrown errors coming from asynchronous func in order to reach error handliding middleware
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findOne({ _id: prodId, userId: req.user._id })
        .then(product => {
            console.log(product)
            if(!product){
                return next(new Error('Product not found'))
            }
            deleteImg(product.imageUrl);
            return Product.deleteOne({ _id: prodId, userId: req.user._id })
            
        })
        .then(() => {
            console.log('product successfully deleted');
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err); // error.message property holds the argument passed
            error.statusCode = 500;
            return next(error); //rap the error object in the next() for thrown errors coming from asynchronous func in order to reach error handliding middleware
        });

};