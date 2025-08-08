const express = require('express');
const controller = require('../controllers/mainController');
const router = express.Router();
const {isGuest} = require('../middleware/auth');

// GET /main - send the home page
router.get('/index', controller.main);

// GET /main/about - send the about page
router.get('/about', controller.about);

// GET /main/contact - send the contact page
router.get('/contact', controller.contact);

module.exports = router;