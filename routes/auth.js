const express = require('express');

const authController = require('../controllers/auth');

const validation = require('../controllers/validation')

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', validation.signInValidator, authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post('/signup', validation.signUpValidator, authController.postSignup);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;