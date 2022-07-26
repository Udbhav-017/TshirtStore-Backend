const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required: [true, 'please provide product name'],
        trim: true,
        maxlength: [120, 'name should be less than 120 chars']
    },

    price : {
        type : Number,
        required: [true, 'please provide product price'],
        maxlength: [6, 'price should not have more than 6 digits']
    },

    description : {
        type : String,
        required: [true, 'please provide product description']
    },

    photos : [
        {
            id : {
                type : String,
                required : true
            },
            secure_url : {
                type : String,
                required : true
            }
        }  
    ],

    categories : {
        type : String,
        required: [true, 'please provide product category from...'],
        enum : {
            values : [
                'shortsleeves',
                'longsleeves',
                'sweatshirt',
                'hoodies'
            ],
            message: 'please select category ONLY from- ....'
        }
    },

    brand : {
        type : String,
        required : [true, "please add a brand for clothing"],
    },
    ratings : {
        type : Number,
        default : 0
    },

    numberOfreviews : {
        type : Number,
        default : 0
    },

    reviews : [
        {
            user : {
                type : mongoose.Schema.ObjectId,
                ref : 'User',
                required : true
            },
            name : {
                type : String,
                required : true
            },
            rating : {
                type : Number,
                required : true,
            },
            comment : {
                type : String,
                required : true
            }
        }
    ],

    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : true
    },

    createdAt : {
        type : Date,
        default : Date.now
    }
});


module.exports = mongoose.model('Product', productSchema);