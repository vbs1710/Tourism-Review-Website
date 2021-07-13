if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const { urlencoded } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const campgroundRoutes = require('./routes/campgrounds')  // campgrounds wale jo routes wali file h usko selecct kra h
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize'); // iski madad se hum query mei se $ ya koi period remove kr denge... agar remove na kre toh?? see this-> (agar remove nhi kiya toh agar kisii ne db.users.find({username:{gt:""}}) aisa kra toh humare saare users ki information with password wagera sab uske paas chali jaayegi toh isiliye ye $ sign wagera ko remove hona must h for protection) 
const helmet = require('helmet');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify:false
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open", () =>{
    console.log("database connected");
})

const app = express();

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({ extended:true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize()); 

const sessionConfig = {
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,  // jab deploy krenge tab isko uncomment kr skte h ..kyuki localhost http pr rhta h na ki https pr toj jab hum deploy krenge toh vo https pr rhega to humara secure wala part bhi done ho jaayega....agar isko localhost mei true kr dunga toh login krne pr bhi login nhi hoga aur mei khudke account se banaya hua campground,review edit aur delete nhi kr paaunga....
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({contentSecurityPolicy:false})); //app.use(helmet({contentSecurityPolicy:false})) agar mei aisa kr du toh mei kahi se bhi internet se kuch bhi link kr skta hu jese ki mei bootstrap add krta hu ya koi image .... agar csp(constentSecurityPolicy) ..lekin niche mei har jagah specify kr dia hu ki mei kaha kaha se add kr rha hu toh csp mujhe unn jagah se allow kr dega add krne ko pr aur koi nayi jagah se add kra jo niche nhi h toh fir vo add nhi hoga ..csp usko remove kr dega...csp usko threat smjhega...although humne kuch security laga di pr abhi humara app watertight nhi h threat se pr humne basic bassic pura cover kr lia security wala part

// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );

app.use(passport.initialize());
app.use(passport.session()); // isko   app.use(session(sessionConfig)); iske baad hi likhna h varna isko pata nhi rhega ki session kya h
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());   // cookie ko bana dega aur store kr lega login krne pr
passport.deserializeUser(User.deserializeUser()); // cookie ko destroy kr dega logout krne pr :)

app.use((req,res,next)=>{
    // console.log(req.session) isko consolelog krne pr session mei hum returnTo wala deks skte h agar vo trigger hua hoga toh 
    res.locals.currentUser = req.user; // req.user humei user ka email , username , id(mongoose wali) .... ab mei ise pure project mei kahi bhi use kr skta hu...ab hum login aur register wala option navbar mei tab hi dikhayenge jab currentUser exist nhi krega ..aur agar currentUser exist krega toh hum sirf logout wala option show krenge.... req.user humei passport ki help se mila h ... passport sab kuch behind the scene kr deta h .....
    res.locals.success = req.flash('success');     // ye middleware lagane se mei flash mei jo bhi string pass krunga usko kisi bhi template mei access kr skta hu...for eg mujhe show tempelate ke router mei koi variable pass nhi krana padega ki jisse mei flash wali string ko access kr sku....middleware ki help se direct access ho jaayega
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds',campgroundRoutes); // router wala part ... /campgrounds har route ke piche add ho jaaeyga... jo bhi prefix dena h hum use 1st parameter mei de skte h app.use ke
app.use('/campgrounds/:id/reviews',reviewRoutes); // router wala part ... /campgrounds/:id/reviews har route ke piche add ho jaaeyga... jo bhi prefix dena h hum use 1st parameter mei de skte h app.use ke
app.use('/',userRoutes);

app.get('/',(req,res)=>{
    res.render('home.ejs')
})




app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})

app.use((err,req,res,next) =>{
    const{statusCode = 500} = err;
    if(!err.message)  message = 'something went wrong!!!!'
    res.status(statusCode).render('error',{err});
}) 

app.listen(3000,()=>{
    console.log("App listening on port 3000");
})