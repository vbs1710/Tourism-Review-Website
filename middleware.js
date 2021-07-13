const ExpressError = require('./utils/ExpressError');
const {campgroundSchema,reviewSchema} = require('./schemas.js');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;  // original path store kr li session mei..
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

// isAuthenticated passport ka hi feature h aur ye khud dekh leta h ki user loggedin h ya nhi.......
// agar loggedin nhi rahogay toh login wale page pr redirect krta rhega...jese ki hum kisi user ko edit ya new campground banana allow nhi krenge jab tak vo loggedin nhi rhega
// ab ek problem ye h ki humei user ko ussi route pr redirect krna hoga jaha vo jaana chah rha tha(matlab user log in nhi h toh hum usko login pr le gye pr login ke baad humei user ko usi page pr le jaana h jaha vo jaana chah rha tha pr logged in nhi tha toh humne ussey redirect kr dia login page pr.....) req.path vo path h jaha vo chala gya..aur req.originalUrl vo path h jaha vo jaana chah rha tha loggedin nhi tha..console.log krke dekh lena inn dono ko for better understanding.....


module.exports.validateCampground = (req,res,next)=>{
    
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}
module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);  // ab problem ye h ki humne edit aur delete ke button toh hide kr diye(jo uss campground ka author ya maalik nhi h uske liye hide rhega) pr fir bhi hum upar url mei /edit wagera krke changes kr skte h toh issey resolve krne ke liye humne ye middleware banaya...
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id,reviewId} = req.params;
    const review = await Review.findById(reviewId);  // ab problem ye h ki humne edit aur delete ke button toh hide kr diye(jo uss review ka author ya maalik nhi h uske liye hide rhega) pr fir bhi hum upar url mei /edit wagera krke changes kr skte h toh issey resolve krne ke liye humne ye middleware banaya...
    if(!review.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        next();
    } 
}