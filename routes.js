module.exports = function(app, passport, fileUpload, util, path) {


const Fascinator       		= require('./models/fascinator');
var loggedIn = false;
    // =====================================
    // ============== ROUTES ===============
    // =====================================

    // =====================================
    // HOME PAGE ===========================
    // =====================================
    app.get('/', function (req, res) {
        console.log("Loggedin? " + req.isAuthenticated())
        const title = "Barbs & Auds Hats and Facinators"
        const tagline = "Bespoke hats & facinators tailored to the event you're lucky enough to be attending"
        
        if (req.user)  loggedIn = true;


        res.render('pages/index', {
            title: title, 
            tagline: tagline,
            loggedIn: loggedIn,
            error: null
            });
    });
    // =====================================
    // ABOUT PAGE ==========================
    // =====================================
    app.get('/about', function(req, res) {
        if (req.user)  loggedIn = true;
        res.render('pages/about', {
            loggedIn: loggedIn,
            }
        );
    });
    // =====================================
    // FASCINATORS PAGE ====================
    // =====================================
    app.get('/fascinators', function(req, res) {
        dynamic_content_width = "col-cust-9"
        //var req = {user: "admin"};
        if (req.user)  loggedIn = req.isAuthenticated(), 
                       dynamic_content_width = "col-cust-12";
        else  loggedIn = false;
        Fascinator.find({}, function(err, fascinators) {
        if (err) throw err;

        var lastCode;
        fascinators.forEach(function(fascinator){
            lastCode = Number(fascinator.code.replace(/\D/g,''));
            lastCode = "F" + Number(lastCode +1);
        })

            res.render('pages/fascinators', {
            "fascinators" : fascinators,
            loggedIn: loggedIn,
            dynamic_width: dynamic_content_width,
            lastCode, lastCode
            });
        });
    });
    app.post('/fascinators', function(req, res) {
        if (!req.files.upload)
        return res.status(400).send('No files were uploaded.');
     
      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      let imageToSave = req.files.upload;
        console.log(imageToSave.name)
      // Use the mv() method to place the file somewhere on your server
      imageToSave.mv('./public/images/facinators/'+ imageToSave.name, function(err) {
        if (err)
          return res.status(500).send(err);
     
        //res.send('File uploaded!');
      });


    var fascinator = new Fascinator({
        _id: req.body.id,
        code: req.body.code,
        price: req.body.price,
        image: req.files.upload.name
    })
    fascinator.save(function(err) {
            if(err) console.log("Problems saving :( - " + err)
            else res.redirect('/fascinators');
        })
    });
    app.post('/fascinators_update', function(req, res) {
        var fascinator = new Fascinator({
            _id: req.body.id,
            code: req.body.code,
            price: req.body.price,
            image: req.body.image
        })
        if(req.body.action === "update"){
            Fascinator.findByIdAndUpdate(req.body.id, fascinator, function(err, model) {
                if (err)  console.log(err)
                else      res.redirect('/fascinators');
                })
        }
        if(req.body.action === "delete"){
            Fascinator.findByIdAndRemove(req.body.id, fascinator, function(err, model) {
                if (err)  console.log(err)
                else      res.redirect('/fascinators');
                })
        }

        });
    // =====================================
    // LOGIN PAGE ==========================
    // =====================================
    app.get('/login', function(req, res) {
        if (req.user)  loggedIn = true;
        res.render('pages/login',{ 
            message: req.flash('loginMessage'),
            loggedIn: loggedIn
        });
    });
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        if (req.user)  loggedIn = true;
        res.render('pages/signup.ejs', { 
            message: req.flash('signupMessage'),
            loggedIn: loggedIn
        });
    });
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        if (req.user)  loggedIn = true;
        if (!req.user)  res.redirect('/');
        res.render('pages/profile.ejs', {
            loggedIn: loggedIn,
            user : req.user // get the user out of session and pass to template
        });
    });
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/', {
            loggedIn: loggedIn,
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


}