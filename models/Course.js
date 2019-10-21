const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
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
  }
});

// Static method to get avg of course tuitions - Static means it have to run on the model (see Middleware below)
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  // console.log('Calculating avg cost...'.blue)

  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' }
      }
    }
  ]);

  // console.log(obj);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10
    })
  } catch (err) {
    console.error(err);
  }
}

// Middleware Call getAverageCost after save 
CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
})

// Middleware Call getAverageCost before remove
CourseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.bootcamp);
})

module.exports = mongoose.model('Course', CourseSchema);
