module.exports = function (app, passport, fileUpload, util, path, aws) {

    const HatContoller = require('./controller/hatController');
    const IndexController = require('./controller/indexController');
    const TextController = require('./controller/textController');
    var loggedIn = false;
    let textService = '';
    
    TextController.text_find_all_get().then(function(result){
        var parent = this; 
        textService = result;
    
    // =====================================
    // Text      ===========================
    // =====================================
    let displaytext = {
        email : textService[0].content[0].text
    }
    // =====================================
    // ============== ROUTES ===============
    // =====================================

    // =====================================
    // HOME PAGE ===========================
    // =====================================
    app.get('/', function (req, res) {
        IndexController.index_read_get(req, res, '/index', displaytext);
       // console.log("Text" + textService);
    });
    app.get('/index', function (req, res) {
        IndexController.index_read_get(req, res, '/index', displaytext)
    });
    // =====================================
    // ABOUT PAGE ==========================
    // =====================================
    app.get('/about', function (req, res) {
        if (req.user) loggedIn = true;
        res.render('pages/about', {
            loggedIn: loggedIn,
            displayText: displaytext
        }
        );
    });
    // =====================================
    // Content PAGE ========================
    // =====================================

    app.post('/content_create', function (req, res) {
        TextController.text_create_update_post(req, function(result){
            parent.textService = result; 
            res.redirect('back');

        });
        //next();
    });

    app.post('/content_update', function (req, res) {
        console.log(req);
        IndexController.index_update_post(req, res).then(function(){
            res.redirect('back');
        });
    });


    // =====================================
    // FASCINATORS PAGE ====================
    // =====================================
    app.get('/fascinators', function (req, res) {
        dynamic_content_width = "col-cust-12"

        if (req.user) loggedIn = req.isAuthenticated(),
            dynamic_content_width = "col-cust-12";
        else loggedIn = false;
        HatContoller.hat_read_get(req, res, loggedIn, dynamic_content_width, displaytext);

    });
    app.post('/fascinators', function (req, res, aws) {
        if (!req.files.upload)
            return res.status(400).send('No files were uploaded.');
        HatContoller.hat_create_post(req, res, aws, displaytext);
    });

    app.post('/fascinators_update', function (req, res) {
        HatContoller.hat_update_post(req, res, displaytext);
    });
    // =====================================
    // HATS PAGE        ====================
    // =====================================
    app.get('/hats', function (req, res) {
        dynamic_content_width = "col-cust-12"

        if (req.user) loggedIn = req.isAuthenticated(),
            dynamic_content_width = "col-cust-12";
        else loggedIn = false;
        HatContoller.hat_read_get(req, res, loggedIn, dynamic_content_width, displaytext);

    });
    app.post('/hats', function (req, res) {
        if (!req.files.upload)
            return res.status(400).send('No files were uploaded.');
        HatContoller.hat_create_post(req, res),displaytext;
    });

    app.post('/hats_update', function (req, res) {
        HatContoller.hat_update_post(req, res, displaytext);
    });

    // =====================================
    // SHOWROOM PAGE    ====================
    // =====================================
    app.get('/showroom', function (req, res) {
        dynamic_content_width = "col-cust-12"

        if (req.user) loggedIn = req.isAuthenticated(),
            dynamic_content_width = "col-cust-12";
        else loggedIn = false;
        HatContoller.hat_read_get(req, res, loggedIn, dynamic_content_width, displaytext);

    });
    app.post('/showroom', function (req, res) {
        if (!req.files.upload)
            return res.status(400).send('No files were uploaded.');
        HatContoller.hat_create_post(req, res, displaytext);
    });

    app.post('/showroom_update', function (req, res) {
        HatContoller.hat_update_post(req, res, displaytext);
    });

    // =====================================
    // LOGIN PAGE ==========================
    // =====================================
    app.get('/login', function (req, res) {
        if (req.user) loggedIn = true;
        res.render('pages/login', {
            message: req.flash('loginMessage'),
            loggedIn: loggedIn, 
            displayText: displaytext
        });
    });
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true, // allow flash messages
        displayText: displaytext
    }));
    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function (req, res) {
        // render the page and pass in any flash data if it exists
        if (req.user) loggedIn = true;
        res.render('pages/signup.ejs', {
            message: req.flash('signupMessage'),
            loggedIn: loggedIn, 
            displayText: displaytext
        });
    });
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function (req, res) {
        if (req.user) loggedIn = true; 
        TextController.text_find_all_get().then(function(docs){
            console.log(docs);
            if (!req.user) res.redirect('/');
            res.render('pages/profile.ejs', {
                textOptions: docs,
                loggedIn: loggedIn,
                user: req.user // get the user out of session and pass to template
            });
        });

    });
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/', {
            loggedIn: loggedIn,
        });
    });
    // =====================================
    // SITEMAP =============================
    // =====================================
    app.get('/sitemap', function (req, res) {
        const fs = require('file-system');
        fs.readFile('sitemap.xml', 'utf8', function (err, data) {
            if (!err && process.env.ENVIRONMENT === 'DEV') {
                console.log(data);
            }
            res.type('application/xml');
            res.send(data);
        });
    });
    // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated())
            console.log('User authenticated')
        return next();

        // if they aren't redirect them to the home page
        res.redirect('/');
    }

});
}