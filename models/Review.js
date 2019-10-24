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

// Static method to get avg rating and save - Static means it have to run on the model (see Middleware below)
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
    // console.log('Calculating avg cost...'.blue)
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    // console.log(obj);

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating
        })
    } catch (err) {
        console.error(err);
    }
}

// Middleware Call getAverageRating after save 
ReviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.bootcamp);
})

// Middleware Call getAverageRating before remove
ReviewSchema.pre('remove', function () {
    this.constructor.getAverageRating(this.bootcamp);
})


module.exports = mongoose.model('Review', ReviewSchema);
