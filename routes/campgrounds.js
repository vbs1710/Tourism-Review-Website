const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds');
var multer  = require('multer')  
const {storage} = require('../cloudinary/index')
var upload = multer({storage})   
const { isLoggedIn,isAuthor,validateCampground } = require('../middleware'); 



router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))         
    // .post(upload.array('image'),(req,res)=>{
    //     console.log(req.body,req.files);    
    //     res.send('It Worked!!')
    // })

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor,upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;