const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const bodyParser = require('body-parser');
const crypto = require('crypto')


const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true 
}))

var path = require('path');
const { Router } = require('express');
app.use(express.static(path.join(__dirname, 'public')));

const secret = crypto.randomBytes(20).toString('hex');

app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/journalDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const journalsSchema = new mongoose.Schema({
    title: String,
    content: String,
    date: String,
})

const Journal = mongoose.model("Journal", journalsSchema);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    journals: [journalsSchema]
})

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/' , (req , res)=>{
    res.redirect('login')
})

app.get('/write' , (req , res)=>{
    if(req.isAuthenticated()){
        res.render('write')
    }else{
        res.redirect('/login')
    }
    
})

app.get('/tutorial', (req, res) => {
    if(req.isAuthenticated()){
        res.render('tutorial')
    }else{
        res.redirect('/login')
    }
});

app.post('/write', (req, res)=>{
    const postTitle = req.body.postTitle
    const postBody = req.body.postBody
    const userId = req.user.id
    const dateTime = new Date();

    const journal = new Journal({
        title: postTitle,
        content: postBody,
        date: dateTime
    })

    User.findById(userId, (err, result)=>{
        if(err){
            console.log(err)
        }else{
            result.journals.push(journal)
            result.save();
           res.redirect('/journal')
        }
    })
})

app.get('/journal' , (req , res)=>{
    if(req.isAuthenticated()){
        User.findOne({_id: req.user.id}, (err, foundUser)=>{
            if(err){
                console.log(err)
            }else if(foundUser.journals.length === 0){
                res.redirect('/tutorial')
            }else{
                res.render("journal", {post: foundUser.journals})
            }
        })
    }else{
        res.redirect('/login')
    }
    
})

app.get('/settings', (req, res) => {
    if(req.isAuthenticated()){
        res.render('settings', {message: "" , email: req.user.username})
    }else{
        res.redirect('/login')
    }
    
});

app.post('/settings' , (req , res)=>{
    const newPassword = req.body.newPassword
    const oldPassword = req.body.oldPassword
    User.findById(req.user.id, (err, result)=>{
        result.changePassword(oldPassword, newPassword, (error)=>{
            if(error){
                res.render('settings', {message: "Password could not be changed", email: req.user.username})
            }else{
                result.save()
                res.render('settings', {message: "User password changed" , email: req.user.username})
            }
        })
    })

})

app.get('/post', (req, res) => {
    if(req.isAuthenticated()){
       res.redirect('/journal')
    }else{
        res.redirect('/login')
    }
});

app.get("/post/:postId", function(req, res){
    if(req.isAuthenticated()){
        const requestedPostId = req.params.postId;

        User.findById(req.user.id, (err, result)=>{
            const resultPost = result.journals
    
            resultPost.forEach(function(post){
                if(post.id === requestedPostId){
                    res.render('post', {title: post.title, content: post.content, postId: requestedPostId})
                }
            })
        })
    }else{
        res.redirect('/login')
    }
})

app.get('/delete/:postId', (req, res)=>{
    if(req.isAuthenticated()){
        const requestedPostId = req.params.postId;

        User.findById(req.user.id, (err)=>{
            const userID = req.user.id
            if(!err){
                User.updateOne({_id: userID}, {"$pull": {"journals": {_id: requestedPostId} }}, {safe: true, multi: true}, function(err){
                    if(!err){
                        res.redirect("/")
                    }
                })
            }
        })
    }else{
        res.redirect('/login')
    }
})

app.get('/login' , (req , res)=>{
    if(req.isAuthenticated()){
        res.redirect('/journal')
    }else{
        res.render('login',  {errorMessage: ""})
    }
    
})

app.get('/settings' , (req , res)=>{
    res.render('settings')
})

app.get('/logout', (req, res)=>{
    req.logOut();
    res.redirect('/')
})

app.post('/login' , (req , res)=>{
    const user = new User({
        email: req.body.username,
        password: req.body.password
    })
    const action = req.body.btn
    
    if(action === 'Login'){
        req.login(user, function (error){
            passport.authenticate("local", { failureRedirect: '/login', failureMessage: true })(req, res, (err)=>{
                res.redirect("/journal");
            })
        })
    }else if(action === 'Register'){
        User.register({username:  req.body.username}, req.body.password, (err, user)=>{
            if(err){
                res.render('login', {errorMessage: "User Exists"})
            }else{
                passport.authenticate('local')(req, res, ()=>{
                    res.redirect('/journal')
                })
            }
        })
    }
})

app.get('/404', (req, res)=>{
    res.render('404')
})

app.all('*', (req, res)=>{
    res.redirect('/404')
})

let port = process.env.PORT;
if(port == null || port == ""){
    port = 8000;
}
console.log(port)
app.listen(port)