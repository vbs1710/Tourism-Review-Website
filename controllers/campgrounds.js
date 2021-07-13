const Campground = require('../models/campground');
const cloudinary = require('cloudinary').v2
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')   // mapbox basically jo bhi location as a string hum use denge vo ussey longitude,latitude format mei convert kr dega jisse humei map pr plot krne mei aasaani ho.......ab jab user naya campground banayega toh hum usse latitude longititude toh fill nhi krwa skte as it is too inappropriate....so thats the reason of using this tool....
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken:mapBoxToken}); // ab ye meri id ya token se access kr skta h 

module.exports.index = async (req,res)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index.ejs',{ campgrounds });
}

module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new.ejs')
}

module.exports.createCampground = async (req,res)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground data',400);
    const geoData = await geocoder.forwardGeocode({       // 2 types of geocoding are there ..first one forward geocoding(location ko string ke form mei lega aur usko longititude latitiude mei convert kr dega)....second one is backward geocoding(just oppsite to the forward geocoding)
        query:req.body.campground.location,
        limit:1
    }).send()   // .send()  is very important ..isko likhna na bhule.... choti si chiz h aur hamesha likhna bhul jaaoge ise toh dhyan rkhna h iska
    // console.log(geoData); isko console krke dekhoge toh dikhega ki humare coordinates features ke 0 wale ke geometry mei h ..humei sirf humare coordinates se matlab h abhi ke liye....jese jese aur info chahiyye hogi hum extract kr lenge geodata se
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f=>({url:f.path,filename:f.filename}));   // jab hum req.files ko console krenge toh array milegi jismei path aur filename ki field hogi toh bas humne uss field se information lekar path mei path ka url daal dia(jo url humne daala vo mongo wale database mei dal jaayega ..same for the filename....filename bhi mongo ke database mei dal jaayega) aur filename wali field mei vo filename daal dia
    campground.author = req.user._id;  // koi bhi naya user register krega toh uske author wale column mei hum uss user ki id(user wale database ki id) ko author mei de denge aur populate krwa denge ...fir hum uske username,email ko access kr skte h...
    await campground.save();
    // console.log(campground);
    req.flash('success','Successfully made a campground')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'      // multiline mei populate kra kyuki humei campground ke review ko populate kra fir humei usi review ke author ko populate krna tha ...toh ye tarika ya syntax hota h ise likhne ka......
        }
    }).populate('author');  // populate ke andar vo field aati h jisko hum populate krna chahte .. matlab ki waha toh objectId stored rhegi pr uski jagah hum vo object ki information show krwana chahte h toh populate krte h...
    // console.log(campground);
    if(!campground){
        req.flash('error','Cannot find that campground');
        res.redirect('/campgrounds');
    }
    // console.log(campground)
    // res.se0nd("Its working");
    res.render('campgrounds/show.ejs',{ campground });
}

module.exports.renderEditForm = async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find that campground');     // agar campground jo delete ho gya aur hum usko visit kre(for eg delete krne se pehle humne uska link copy kr lia) toh campground to exist hi nhi krta toh isiliye humne flash dikha dia.....same agar hum deleted campground ko edit krenge toh flash display krwa denge...
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}

module.exports.updateCampground = async(req,res)=>{
    const {id} = req.params;
    console.log(req.files); //ye mei tab use kiya tha jab mei edit ke time individual image ko delete krna chah rha tha.....
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs = req.files.map(f=>({url:f.path,filename:f.filename}));
    console.log(`The imgs is`,imgs);
    campground.images.push(...imgs);  // imgs mei ek array aayegi humari images ki aur hum seedha campground.images = imgs nhi kr skte kyuki fir vo seedha purani wali ke saath replace ho jaayegi so to avoid that we pusht the elements of the imgs array(... spread operator ki madad se array ke ek ek element ko spread krke push krwa dia...)
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages)
        {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages } } } })  // uss image ko pull krlo campground mei se jiska filename h req.body.deleteImages ke andar
    }
    req.flash('success','successfully updated the campground')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','successfully deleted the campground')
    res.redirect('/campgrounds');
}