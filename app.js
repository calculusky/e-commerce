/********* import ***********/
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const mongoose = require('mongoose');
const csrf = require('csurf');
const multer = require('multer');
const app = express(); //express function
//import
const errorController = require('./controllers/error');
const User = require('./models/user');



/***** declare constants *********/
const MONGODB_URI = 'mongodb://localhost:27017/shop';
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

//set file storage for multer
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        //console.log(file)
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); //new Date().toISOString() + '-' + file.originalname)
    }
});
//filter the file type
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false)
    }
}

const handleError = (err, next) => {
    console.log(err);
    next(err);
}


//set view engine
app.set('view engine', 'ejs');
app.set('views', 'views');

//import routes 
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoute = require('./routes/auth');

//register middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
        //onError: handleError
}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store
}));

// register dummy user
// app.use((req, res, next) => {
//     User.findById('5e53ce11eb01a7216c08e27d')
//         .then(user => {
//             req.user = user;
//             req.edu = {
//                     hubby: 'football',
//                     work: 'vascon solutions'
//                 }
//                 // console.log(req);
//             next();
//         })
//         .catch(err => console.log(err))
// });

app.use(flash());
app.use(csrf());

//send data across all pages ------place above the routes middleware---------- !important
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

//fetch the logged in user from db and store in the request message with full mongoose methods
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    // console.log(req.session.isLoggedIn)
    User.findById(req.session.user._id)
        .then(user => {
            //throw new Error('error occured')
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err))
        })
});




//routes 
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoute);
app.use(errorController.get404);
// special middleware for throwing error
// app.use((error, req, res, next) => {
//     //console.log(req.session.isLoggedIn);
//     res.render('errors/500', {
//         pageTitle: 'Internal server error',
//         path: '/500',
//         isAuthenticated: req.session.isLoggedIn
//     });
// })



const port = process.env.PORT || 8080;
//mongoose.connect('mongodb+srv://node-course-user:N6vsvc083eLUaqrt@neduskycluster-bgkf2.mongodb.net/shop', { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(result => {
        app.listen(port, () => console.log(`connected at port ${port}`));
    })
    .catch(err => console.log(err));