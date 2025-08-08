const Event = require('../models/event');

// check if user is a guest
exports.isGuest = (req, res, next) => {
    if(!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are already logged in.');
        return res.redirect('/user/profile');
    }
};

// check if the user is authenticated
exports.isLoggedIn = (req, res, next) => {
    if(req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to log in first.');
        return res.redirect('/user/login');
    }
};

//check if the user is the author of the event
exports.isAuthor = (req, res, next) => {
    let id = req.params.id;

    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid event id');
        err.status = 400;
        return next(err);
    }
    Event.findById(id)
    .then(event => {
        if(event) {
            if(event.host.toString() === req.session.user._id.toString()) {
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource.');
                //req.flash('error', err.message);
                //err.status = 401;
                //return next(err);
                req.flash('error', 'As a host of the event, you cannot RSVP.');
                return res.redirect('/events/' + id);
            }
        } else {
            let err = new Error('Cannot find and update event with id ' + id );
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};