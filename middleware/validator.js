const {body} = require('express-validator');
const{validationResult} = require('express-validator');
var validator = require('validator');
const event = require('../models/event');

exports.validateSignUp = [body('firstName', 'First name cannot be empty.').notEmpty().trim().escape(),
    body('lastName', 'Last name cannot be empty').notEmpty().trim().escape(),
    body('email', 'Email must be valid email address.').isEmail().trim().escape().normalizeEmail(), 
    body('password', 'Password must be at least 8 characters and at most, 64.').isLength({min: 8, max: 64})];

exports.validateLogIn = [body('email', 'Email must be valid email address.').isEmail().trim().escape().normalizeEmail(), 
    body('password', 'Password must be at least 8 characters and at most, 64.').isLength({min: 8, max: 64})];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
}


exports.validateEvent = 
    [body('category', 'category cannot be empty.').notEmpty().trim().escape().isIn(['Sports', 'Social', 'Workshop', 'Charity/Fundraiser', 'Festival', 'Other']),
    body('title', 'title cannot be empty').notEmpty().trim().escape(),
    body('location', 'location cannot be empty.').notEmpty().trim().escape(), 
    body('host', 'host cannot be empty.').notEmpty().trim().escape(),
    body('start', 'start cannot be empty').notEmpty().trim().escape().isAfter(event.start),
    body('end', 'end cannot be empty').notEmpty().trim().escape(),
    body('details', 'details cannot be empty').notEmpty().trim().escape(),
    body('image', 'image cannot be empty').notEmpty().trim().escape()
];

exports.validateRSVP = 
    [body('status', 'status cannot be empty.').notEmpty().trim().escape().isIn(['YES', 'NO', 'MAYBE']),
    body('user', 'user cannot be empty').notEmpty().trim().escape(),
    body('event', 'event cannot be empty.').notEmpty().trim().escape(), 
];