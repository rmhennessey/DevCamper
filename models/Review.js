const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for the review'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        // need to add this so we know what course goes with what bootcamp
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp', // need so we know what model to reference
        required: true
    },
    user: {
        // need to add this so we know what course goes with what bootcamp
        type: mongoose.Schema.ObjectId,
        ref: 'User', // need so we know what model to reference
        required: true
    }
});

// Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true })

module.exports = mongoose.model('Review', ReviewSchema);
