exports.get404 = (req, res, next) => {
    res.status(404)
        .render('errors/404', { pageTitle: 'Page Not Found', path: '/404', isAuthenticated: req.session.isLoggedIn });
};

// exports.get500 = (req, res, next) => {
//     res.render('500', {
//         pageTitle: 'Internal server error',
//         path: '/500',
//         isAuthenticated: req.session.isLoggedIn
//     });
// }