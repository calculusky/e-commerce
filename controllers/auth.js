const User = require('../models/user');
const bcrypt = require('bcryptjs');
const transporter = require('./mail');
const crypto = require('crypto');
const { validationResult } = require('express-validator')

exports.getLogin = (req, res, next) => {
    //   const isLoggedIn = req
    //     .get('Cookie')
    //     .split(';')[1]
    //     .trim()
    //     .split('=')[1] === 'true';
    //console.log(req.session); 


    // let errorMessage = req.flash('error'); // if no value, returns an empty array []
    // let message;
    // if (errorMessage.length > 0) {
    //     message = errorMessage[0]; // errorMessage can also work, as well as errorMessage[0]
    //     //console.log(message)
    // } else {
    //     message = null;
    //     //console.log(message)
    // }

    let msg = req.flash('msg');
    //console.log(msg)
    if (msg.length > 0) {
        msg = msg[0];
    } else {
        msg = null;
    }

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: msg,
        validationErrors: [],
        oldInput: {
            email: '',
            password: ''
        }
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    // console.log(errors)

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            oldInput: {
                email,
                password
            }
        })
    }


    User.findOne({ email: email })
        .then(user => {
            //throw new Error('sync dummy error');
            if (!user) {
                // req.flash('error', 'Invalid email or password');      ********replaced with validator********
                // return res.redirect('/login')

                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password',
                    validationErrors: [],
                    oldInput: {
                        email,
                        password
                    }
                })
            }
            bcrypt.compare(password, user.password)
                .then(matched => {
                    //console.log(matched + ' bcrypt result');
                    if (matched) {
                        req.session.user = user;
                        req.session.isLoggedIn = true;
                        return req.session.save(err => {
                            res.redirect('/');
                        })
                    }
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password',
                        validationErrors: [],
                        oldInput: {
                            email,
                            password
                        }
                    })
                })
        })
        .catch(err => {
            const error = new Error(err); // error.message property holds the argument passed
            error.statusCode = 500;
            return next(error); //rap the error object in the next() for thrown errors coming from asynchronous func in order to reach error handliding middleware
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        //console.log(err);
        res.redirect('/');
    })
}

exports.getSignup = (req, res, next) => {
    let errorMessage = req.flash('error');
    if (errorMessage.length > 0) {
        errorMessage = errorMessage[0];
    } else {
        errorMessage = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessages: errorMessage,
        validationErrors: [],
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        }
    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const error = validationResult(req);
    //console.log(req)
    console.log(error.errors, 'error o/p');

    if (!error.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessages: error.array(), //error.array() or error.errors
            validationErrors: error.array(),
            oldInput: {
                email: email,
                password: password,
                confirmPassword: confirmPassword
            }
        })
    }

    // User.findOne({ email: email })                                  //done with express-validator
    //     .then(userDoc => {
    //         if (userDoc) {
    //             req.flash('error', 'Email already exists')
    //             return res.redirect('/signup')
    //         }
    return bcrypt.hash(password, 12)
        .then(harshedPassword => {
            const user = new User({
                email: email,
                password: harshedPassword,
                cart: { items: [] }
            });
            return user.save();

        })
        .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                    from: 'calculusky@gmail.com',
                    to: email,
                    subject: 'Signup completed',
                    html: `<div style="background:blue; color:white; padding:10px; border-radius:5px">
                                        <h2 style="color:yellow"> You successfully signed up </h2>
                                        <p>Hi, your account has been successfully created. click on this <a style="color:yellow; text-decoration:none" href="http://localhost:8080">link </a> to go back</p>
                                        <p> Warm regards, </p>
                                   </div>`
                })
                .then(success => console.log(success))
                .catch(err => console.log(err));
        })
        .catch(err => {
            const error = new Error(err); // error.message property holds the argument passed
            error.statusCode = 500;
            return next(error); //rap the error object in the next() for thrown errors coming from asynchronous func in order to reach error handliding middleware
        });

};

exports.getReset = (req, res, next) => {
    let msg = req.flash('msg');
    if (msg.length > 0) {
        msg = msg[0];
    } else {
        msg = null;
    }
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        message: msg
    })
}

exports.postReset = (req, res, next) => {
    //generate token for the given user and save to the database
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        //console.log(buffer);
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('msg', 'Account not found');
                    return res.redirect('/reset')
                }
                user.resetToken = token;
                console.log(user.resetToken);
                user.resetTokenExpiration = Date.now() + 600000;
                user.save()
                    .then(result => {
                        console.log(result)
                        req.flash('msg', 'password reset link has been sent to your email');
                        res.redirect('/reset');
                        return transporter.sendMail({
                            from: 'calculusky@gmail.com',
                            to: req.body.email,
                            subject: 'Password Reset',
                            html: `<div style="background:blue; color:white; padding:10px; border-radius:5px">
                                    <h2 style="color:yellow"> Password Reset </h2>
                                    <p>Hi, kindly click on the password reset link below to reset your password.</p>
                                    <p><a style="color:yellow; text-decoration:none" href="http://localhost:8080/reset/${token}">Reset Password </a></p><br>
                                    <p> Warm regards, </p>
                               </div>`
                        })
                    })
                    .then(success => console.log(success))
                    .catch(err => console.log(err));
            })

        .catch(err => {
            const error = new Error(err); // error.message property holds the argument passed
            error.statusCode = 500;
            return next(error); //rap the error object in the next() for thrown errors coming from asynchronous func in order to reach error handliding middleware
        })
    })
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                return res.redirect('/')
            }
            res.render('auth/new-password', {
                pageTitle: 'new password',
                path: '/new-password',
                userId: user._id.toString(),
                token: token
            });
        })
        .catch(err => {
            const error = new Error(err); // error.message property holds the argument passed
            error.statusCode = 500;
            return next(error); //rap the error object in the next() for thrown errors coming from asynchronous func in order to reach error handliding middleware
        })

};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.newPassword;
    const passwordToken = req.body.token;
    let resetUser;
    User.findOne({
            resetToken: passwordToken,
            resetTokenExpiration: { $gt: Date.now() }
        })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12)
        })
        .then(harshedPassword => {
            resetUser.password = harshedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            console.log(result);
            req.flash('msg', 'password successfully updated');
            res.redirect('/login')
        })
        .catch(err => {
            const error = new Error(err); // error.message property holds the argument passed
            error.statusCode = 500;
            return next(error); //rap the error object in the next() for thrown errors coming from asynchronous func in order to reach error handliding middleware
        });
}