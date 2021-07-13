const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id; // uske author wale column mei humne id(ye vo id h jo user wale database mei uss user ki id thi) ko de dia.....fir hum populate krwa denge aur fir jisne review add kra h usko username ko access kr skte h
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Review has been successfully added');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})    // pehle id se campground mei item find kra aur update kr denge pull operator ki help se ..pull basically uss item mei reviews wale part mei reviewId ko pull kr dega aur update kr dega...basically reviewId wala review waha se remove ho jaayega..
    await Review.findByIdAndDelete(reviewId)  // campground model se humne review ko delete kr dia aur ab review wale model mei se review ko delete kr dege....so ab reviewId ka review kahi bhi existr nhi krega.....but problem waha hogi jab hum pura campground delete kr denge ...toh uss time review toh exist krega...toh uske liye delete middleware use hota h....
    req.flash('success','Your review has been successfully deleted');
    res.redirect(`/campgrounds/${id}`);
};