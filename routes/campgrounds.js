const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds');
var multer  = require('multer')  // multer is a middleware jo humari req object pr body object ya file or files object ko add kr deta h....body object mei form ke dwara submit kiya gya text rehta h aur file or files object mei form mei jo file submit kri h vo rehti h/+..........ab hum image directly toh store nhi kr skte mongo mei kyuki image ki size badi hoti h toh image store krne ke liye cloudinary use krenge jisse ki hum usspre image store krwa denge aur vo humei us image ka url de dega jisse ki hum mongo mei image ka url store krwa lenge(url ki size badi nhi hogi toh storage purpose solved)
const {storage} = require('../cloudinary/index')
var upload = multer({storage})   // upload se hum file jo store hogi uski dest(destination) store kr rhe....
const { isLoggedIn,isAuthor,validateCampground } = require('../middleware'); // isloggedin wala middleware .. jis bhi route pr jaane ke liye login ki need ghogi ise waha use kr lenge...



router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))         // pehle image upload wagera fir validation(beacuase req.body ki kuch problem ho rhi validation mei due to multer) ... it sounds annoying that without any validation we are uploading the data....we will fix the issue..
    // .post(upload.array('image'),(req,res)=>{
    //     console.log(req.body,req.files);    // single ke parenthesis ke andar vo field aayegi jis field ko vo form mei search krega(jese ki humne form mei input file wale ko name mei image dia toh single ke parenthesis mei bhi image aayega)
    //     res.send('It Worked!!')
    // })

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor,upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;