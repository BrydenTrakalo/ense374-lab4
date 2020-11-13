// add all your boilerplate code up here
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")

// new requires for passport
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

// allows using dotenv for environment variables
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// set up session
app.use(session({
    secret: process.env.SECRET, // stores our secret in our .env file
    resave: false,              // other config settings explained in the docs
    saveUninitialized: false
}));

// set up passport
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

// passport needs to use MongoDB to store users
mongoose.connect("mongodb://localhost:27017/labDB", 
                {useNewUrlParser: true, // these avoid MongoDB deprecation warnings
                 useUnifiedTopology: true});

// This is the database where our users will be stored
// Passport-local-mongoose handles these fields, (username, password), 
// but you can add additional fields as needed
const userSchema = new mongoose.Schema ({
    username: String,
    password: String
})
const taskSchema = new mongoose.Schema ({
    name: String,
    owner: userSchema,
    creator: userSchema,
    done: Boolean,
    cleared: Boolean
});

// configure passportLocalMongoose
userSchema.plugin(passportLocalMongoose);

// Collection of users
const User = new mongoose.model("User", userSchema)
//tasks
const Task = mongoose.model("Task", taskSchema);

// more passport-local-mongoose config
// create a strategy for storing users with Passport
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const port = 3000; 

app.listen (port, function() {
    // code in here runs when the server starts
    console.log("Server is running on port " + port);
})

// root route
app.get("/", function(req, res){
    // code in here runs when the user "gets" the "/" route
    res.render("login")
   
});

// register route
app.post("/register", function(req, res) {
    console.log("Registering a new user");
    // calls a passport-local-mongoose function for registering new users
    // expect an error if the user already exists!
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
            console.log(err);
            res.redirect("/")
        } else {
            // authenticate using passport-local
            // what is this double function syntax?! It's called currying.
            passport.authenticate("local")(req, res, function(){
                res.redirect("/todo")
            });
        }
    });
});

// login route~
app.post("/login", function(req, res) {
    console.log("A user is logging in")
    // create a user
    const user = new User ({
        username: req.body.username,
        password: req.body.password
     });
     // try to log them in
    req.login (user, function(err) {
        if (err) {
            // failure
            console.log(err);
            res.redirect("/")
        } else {
            // success
            // authenticate using passport-local
            passport.authenticate("local")(req, res, function() {
                res.redirect("/todo"); 
            });
        }
    });
});

// This syntax does mostly the same thing, but less intuitive and not as easy to debug
// app.post('/login', passport.authenticate('local', { successRedirect: '/welcome',
//                                                      failureRedirect: '/'}));

app.get("/todo", function(req, res){
    console.log("A user is accessing todo")
    if (req.isAuthenticated()) {
        Task.find(function(err, results) {
            if (err) {
                console.log(err);
            } else {
                tasks = results;
            }
            // pass the username to EJS
        res.render("todo", {user: req.user.username, storedTasks: tasks});
        });
    } else {
        res.redirect("/");
    }
});

// welcome
app.get("/welcome", function(req, res){
    console.log("A user is accessing Welcome")
    if (req.isAuthenticated()) {
        // pass the username to EJS
        res.render("welcome", {user: req.user.username});
    } else {
        res.redirect("/");
    }
});

// logout
app.get("/logout", function(req, res){
    console.log("A user logged out")
    req.logout();
    res.redirect("/");
})