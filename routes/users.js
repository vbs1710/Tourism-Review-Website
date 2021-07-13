const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users')

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));   // router.route krke hum jinka path same h bas method alag h toh hum inko iss tarah se combine kr skte h .... router.route mei path likh do aur niche konsa route h vo likhdo(jese ki get post delete wagera wagera)

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

module.exports = router;