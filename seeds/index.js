const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedhelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '6089973fd8ab8a2880915a31',
            location: `${cities[random1000].city} , ${cities[random1000].state}`,
            title: `${sample(descriptors)}  ${sample(places)}`,
            images: [
                {

                    url: 'https://res.cloudinary.com/dqjxsgglc/image/upload/v1619765113/YelpCamp/vovjm4ci6zfgdgsi8spa.jpg',
                    filename: 'YelpCamp/vovjm4ci6zfgdgsi8spa'
                },
                {

                    url: 'https://res.cloudinary.com/dqjxsgglc/image/upload/v1619765114/YelpCamp/acbvzjaap8smwdi0mqf2.png',
                    filename: 'YelpCamp/acbvzjaap8smwdi0mqf2'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit delectus error soluta harum consequatur accusamus veniam tenetur quam, suscipit incidunt est atque quod nisi amet dolor aliquid similique ad, cupiditate quidem repellendus exercitationem provident fugit voluptatum. Illum praesentium eveniet quis.',
            price,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude,cities[random1000].latitude]
            }
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})