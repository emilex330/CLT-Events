const express = require('express');
const controller = require('../controllers/userController');
const router = express.Router();
const {isGuest, isLoggedIn} = require('../middleware/auth');
const {logInLimiter} = require('../middleware/rateLimiters');
const{validateSignUp, validateLogIn, validateResult} = require('../middleware/validator');

// GET /user/new - send the signup page
router.get('/new',isGuest, controller.new);

// POST /user/login - create new user
router.post('/login', isGuest, validateSignUp, validateResult, controller.createUser);

// GET /user/login - send the login page
router.get('/login', isGuest, controller.login);

// POST /user/profile - process login
router.post('/profile', logInLimiter, isGuest, validateLogIn, validateResult,  controller.processLogin);

// GET /user/profile - send the profile page
router.get('/profile', isLoggedIn, controller.profile);

// GET /user/logout - log out the user
router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;