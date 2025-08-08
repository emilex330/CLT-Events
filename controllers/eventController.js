const { isFunction } = require('util');
const model = require('../models/event');
const event = require('../models/event');
const session = require('express-session');
const date = require('date-and-time');
const { DateTime }  = require("luxon");
const RSVP = require('../models/rsvp');

exports.index = (req, res, next) => {
    model.find()
    .then(events => {
        // find distinct categories
        const categories = events.map(item => item.category).filter((value, index, self) => self.indexOf(value) === index);
        res.render('./event/index', {events, categories})})
    .catch(err => next(err));
};

exports.new = (req, res) => {
    res.render('./event/newEvent');
};

exports.create = (req, res, next) => {
    let event = new model(req.body); // create a new event
    let image = "/images/" + req.file.filename;
    event.image = image;
    event.host = req.session.user;

    // make sure start date is before end date
    if (event.start >= event.end) {
        let err = new Error('Start date must be before end date');
        err.status = 400;
        return next(err);
    }

    // make sure end date is after start date
    if (event.end <= event.start) {
        let err = new Error('End date must be after start date');
        err.status = 400;
        return next(err);
    }

    event.save() //insert new event
    .then((event) => {
        res.redirect('/events')})
    .catch(err => {
        if(err.name === 'ValidationError') {
            err.status = 400;
            }
        next(err);
    });
};

exports.show = async (req, res, next) => {
  const id = req.params.id;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const err = new Error('Invalid event id');
    err.status = 400;
    return next(err);
  }

  try {
    const event = await model.findById(id).populate('host', 'firstName lastName');
    if (!event) {
      const err = new Error('Cannot find event with id ' + id);
      err.status = 404;
      return next(err);
    }

    const rsvpCount = await RSVP.countDocuments({ event: id });

    // Format the start and end dates
    const formattedStart =  event.start = DateTime.fromJSDate(event.start).toLocaleString(DateTime.DATETIME_MED);
    const formattedEnd =  event.end = DateTime.fromJSDate(event.end).toLocaleString(DateTime.DATETIME_MED);

    res.render('./event/show', { event, rsvpCount, formattedStart, formattedEnd });
  } catch (err) {
    next(err);
  }
};



exports.edit = (req, res, next) => {
    let id = req.params.id;

    model.findById(id)
    .then(event => {
        if (!event) {
            const err = new Error('Event not found');
            err.status = 404;
            throw err;
        }

        // Format for <input type="datetime-local">: YYYY-MM-DDTHH:mm
        const inputStart = DateTime.fromJSDate(event.start).toFormat("yyyy-MM-dd'T'HH:mm");
        const inputEnd = DateTime.fromJSDate(event.end).toFormat("yyyy-MM-dd'T'HH:mm");

        // Format for <input type="datetime-local">: YYYY-MM-DDTHH:mm
        //const formattedStart = event.start.toISOString().slice(0, 16);
        //const formattedEnd = event.end.toISOString().slice(0, 16);

        res.render('./event/edit', { event, inputStart, inputEnd });
    })
    .catch(err => next(err));
};


exports.update = (req, res, next) => {
    let event = req.body;
    let id = req.params.id;

    // make sure start date is before end date
    if (event.start >= event.end) {
        let err = new Error('Start date must be before end date');
        err.status = 400;
        return next(err);
    }

    // make sure end date is after start date
    if (event.end <= event.start) {
        let err = new Error('End date must be after start date');
        err.status = 400;
        return next(err);
    }

    // If a new image was uploaded
    if (req.file) {
        event.image = `/images/${req.file.filename}`;
    }

    model.findByIdAndUpdate(id, event, {useFindAndModify: false})
    .then(event => {
        res.redirect('/events/' + id);
    })
    .catch(err => {
        if(err.name === 'ValidationError') {
            err.status = 400;
        }
        next(err)});
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    let rsvp = req.body.id;

    model.findByIdAndDelete(id, rsvp, {useFindAndModify: false})
    .then(event => {
        res.redirect('/events');
    })
    .catch(err => next(err));
};

exports.rsvp = (req, res, next) => {
    let id = req.params.id;
    const user = req.session.user;

    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid event id');
        err.status = 400;
        return next(err);
    }
    event.findById(id)
    .then(event => {
        if(event) {
            if (!req.session.user){
                req.flash('error', 'You need to log in first.');
                return res.redirect('/user/login');
            }
            //check if the user is logged in and author of the event
            if(event.host.toString() === req.session.user._id.toString()) {
                req.flash('error', 'As a host of the event, you cannot RSVP.')
                let err = new Error('Unauthorized to access the resource.');
                err.status = 401;
                //return next(err);
                return res.redirect('/events/' + id); // or another route
            }
            if(req.session.user != event.host) {
                let stat = req.body.status;
                RSVP.findOneAndUpdate({user, event: id}, {status: stat}, {upsert: true, new: true})
                .then(() => {
                    res.redirect('/user/profile')})
                .catch(err => {
                    if(err.name === 'ValidationError') {
                         err.status = 400;
                    }
                    next(err);
                });
            }
        } else {
            let err = new Error('Cannot find and update event with id ' + id );
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
}