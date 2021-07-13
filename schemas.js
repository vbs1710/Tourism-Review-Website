// const Joi = require('joi');

// module.exports.campgroundSchema = Joi.object({
//     campground: Joi.object({
//         title: Joi.string().required(),
//         price: Joi.number().required().min(0),
//         // image: Joi.string().required(),
//         location: Joi.string().required(),
//         description: Joi.string().required()      
//     }).required(),
//     deleteImages: Joi.array()  // agar ye nhi krunga toh jab mei edit ke time koi image delete krunga toh validateCampground ki vajh se deleteImages is not allowed wala error aayega
// })

// // ye joi wala part krne se hum server side error bhi handle kr rhe h.... jese ki kooi agar postman se new campground ki req daal rha toh vo client side validation ko skip kr skta h toh agar kisi ne postman se req kri toh hum server side pr bhi joi ki madad se error show krwa skte h....client side wale error validation se ho gya tha jo humne bootstrap se form ke andar novalidate kra aur input ko required kr dia toh vaha se form tab hi submit hoga jab sab filled ho .... 

// // ye koi database ka schema nhi h ..humne ye bas validation schema banaya h ki har element ka kuch iss type ki value hogi..aur agar nhi hui toh joi khud apne aap error dikha dega ...aur uss error ko hum catch krke show kr denge

// module.exports.reviewSchema = Joi.object({
//     review:Joi.object({
//         rating: Joi.number().required().min(1).max(5),
//         body: Joi.string().required()
//     }).required()
// });



const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'     // ye extension wale ka function ye h ki agar koi review daalte time ya title daalte time usmei html likh rha h aur humare app ko spoil kr rha h toh vo html remove kr dega aur error aa jaayega that it cant contain the html....
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})