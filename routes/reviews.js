const express = require('express');
const router = express.Router({mergeParams:true});   // mergeParams isliye true kra kyuki humara id wala part prefix mei h toh hum id ko access nhi kr paayenge kyuki vo preefix mei h.... so to access id we have to made this option true.....
const Review = require('../models/review');
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const {validateReview,isLoggedIn,isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');



router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReview))

router.delete('/:reviewId',isLoggedIn,isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;