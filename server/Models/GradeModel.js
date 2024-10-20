const mongoose = require('mongoose');

const SubjectsSchema = new mongoose.Schema({
  grade: {
    type: String, // or Number depending on your schema
    required: true
  },
  subjects: {
    type: [String],
    required: true
  }
});

const Subjects = mongoose.model('Subjects', SubjectsSchema);

module.exports = Subjects;
