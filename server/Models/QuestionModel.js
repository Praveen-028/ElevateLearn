const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  choices: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  }
});

const Question = mongoose.model('Question', QuestionSchema);

module.exports = Question;
