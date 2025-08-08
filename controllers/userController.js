const session = require('express-session')
const User = require('../models/user');
const flash = require('connect-flash');
const Event = require('../models/event');
const RSVP = require('../models/rsvp');

exports.new = (req, res) => {
    return res.render('./user/new');
};

exports.login = (req, res) => {
return res.render('./user/login');
};

exports.createUser = (req, res, next) => {

    let user = new User(req.body);
    if(user.email){
        user.email = user.email.toLowerCase();
    }
    user.save()
    .then(user => {
        req.flash('success', 'Profile created successfully.');
        res.render('./user/login');
    })
    .catch(err => {
        if(err.name === 'ValidationError') {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        if(err.code === 11000) {
            req.flash('error', 'This email address is already being used.');
            return res.redirect('back');
        }
        next(err)})
};

exports.processLogin = (req, res, next) => {
   
    // authenticate user's log in request
    let email = req.body.email;
    if(email)
        email = email.toLowerCase();
    let password = req.body.password;
    // get the user that matches the email
    User.findOne({email: email})
    .then(user => {
        if(user) {
        // user found
            user.comparePassword(password)
            .then(result => {
                if(result) {
                    req.session.user = {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    }
                    req.flash('success', 'You have successfully logged in.')
                    return res.redirect('/main/index')
                } else {
                    //console.log('Wrong password');
                    req.flash('error', 'Wrong password.')
                    return res.redirect('back');
                }
            })
        } else {
            //console.log('Wrong email address');
            req.flash('error', 'Wrong email address.')
            return res.redirect('back');
        }
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next) => {
    let id = req.session.user;
    
    Promise.all([User.findById(id), 
        Event.find({host: id}), 
        RSVP.find({user: id}).populate('event')]) // RSVP.find({status: s})
    .then(results => {
        const[user, events, rsvps] = results; // rsvp
        res.render('./user/profile', {user, events, rsvps});//rsvp
    })
    .catch(err => next(err));
};

exports.logout = (req, res, next) => {
    req.session.destroy(err => {
    if(err)
        return next(err);
    else
        res.redirect('/main/index');
    })   
};