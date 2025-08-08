const { contentType } = require('mime-types');
const mongoose = require('mongoose');
const { type } = require("os");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    category: {type: String, 
                required: [true, 'category is required'],
                enum: ['Sports', 'Social', 'Workshop', 'Charity/Fundraiser', 'Festival', 'Other']},
    title: {type: String, 
            required: [true, 'title is required']},
    location: {type: String, 
                required: [true, 'location is required']},
    host: {type: Schema.Types.ObjectId, ref: 'User'},
    start: {type: Date, 
            required: [true, 'start date/time is required']},
    end: {type: Date, 
            required: [true, 'end date/time is required']},
    details: {type: String, 
                required: [true, 'details are required']},
    image: {type: String,
            required: [true, 'image is required']
            }
});

// collection name is events in the database
module.exports = mongoose.model('Event', eventSchema);