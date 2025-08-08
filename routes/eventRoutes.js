const express = require('express');
const controller = require('../controllers/eventController');
const { fileUpload } = require('../middleware/fileUpload');
const {isLoggedIn, isAuthor, sendUserInfo} = require('../middleware/auth');
const router = express.Router();
const{validateResult} = require('../middleware/validator');

// GET /events - send all events
router.get('/', controller.index);

// GET /events/new - send a form to create a new event
router.get('/new', isLoggedIn, controller.new);

// POST /events - create and add a new event
router.post('/', fileUpload, isLoggedIn, validateResult, controller.create);

// GET /events by ID - send an event identified by ID
router.get('/:id', controller.show);

/*GET /events:id/edit - send a form of an existing event
to be edited*/
router.get('/:id/edit', fileUpload, isLoggedIn, isAuthor, controller.edit);

// PUT /stories:id- update the story found by ID
router.put('/:id', fileUpload, isLoggedIn, isAuthor, validateResult, controller.update);

// DELETE /stories:id- delete the story found by ID
router.delete('/:id', isLoggedIn, isAuthor, controller.delete);

/*GET /events:id/rsvp - submit a rsvp request*/
router.post('/:id/rsvp', controller.rsvp);

module.exports = router;