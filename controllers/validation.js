const { check, body } = require('express-validator');
const User = require('../models/user');

exports.signUpValidator = [
    check('email')
    .isEmail()
    .withMessage(' please enter a valid email address')
    .trim()
    .normalizeEmail()
    .custom((value, { req }) => {
        return User.findOne({ email: req.body.email }) // req.body.email can also be replaced with value
            .then(userDoc => {
                //console.log(userDoc)
                if (userDoc) {
                    return Promise.reject('Email already used');
                }
            })
    }),
    body('password', 'password must be minimum of 5 and alphanumeric').isLength({ min: 5 }).isAlphanumeric(),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('password do not match')
        }
        return true;
    })
];

exports.signInValidator = [
    check('email').isEmail().withMessage('email has to be valid'),
    body('password', 'password has to be valid').isLength({ min: 5 }).isAlphanumeric()
];

exports.addProductValidator = [
    body('title', 'invalid title').isString().isLength({ min: 3 }).trim(),
    //body('imageUrl').isURL().withMessage('invalid image url').trim(),
    body('price').isFloat().withMessage('price must be numeric or decimal input'),
    body('description', 'text must be valid with a minimum of 5 characters').isLength({ min: 5, max: 400 }).trim()
];

exports.editProductValidator = [
    body('title', 'invalid title').isString().isLength({ min: 3 }).trim(),
    //body('imageUrl').isURL().withMessage('invalid image url').trim(),
    body('price').isFloat().withMessage('price must be numeric or decimal input'),
    body('description', 'text must be valid with a minimum of 5 characters').isLength({ min: 5, max: 400 }).trim()
]