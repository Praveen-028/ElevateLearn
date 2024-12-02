const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const MONGO_URI = 'mongodb+srv://elevatelearnadmin:123Admin@elevatelearn.wptmq.mongodb.net/?retryWrites=true&w=majority&appName=Elevatelearn';

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the schema for questions
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
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length === 4; // Ensure exactly 4 choices
      },
      message: 'You must provide exactly 4 choices.'
    }
  },
  correctAnswer: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        return this.choices.includes(value); // Correct answer must be one of the choices
      },
      message: 'Correct answer must be one of the choices.'
    }
  }
});

// Create the Question model
const Question = mongoose.model('Question', QuestionSchema);

// Define your questions
const questionsData = {
  Math: [
    { question: 'What is the probability of rolling a 4 on a standard six-sided die?', choices: ['1/6', '1/3', '1/2', '1/4'], correctAnswer: '1/6' },
    { question: 'If you flip a fair coin, what is the probability of getting heads?', choices: ['0', '1/2', '1/4', '1'], correctAnswer: '1/2' },
    { question: 'In a standard deck of 52 cards, what is the probability of drawing a spade?', choices: ['1/4', '1/13', '1/2', '3/4'], correctAnswer: '1/4' },
    { question: 'What is the probability of rolling a sum of 2 with two six-sided dice?', choices: ['1/36','1/12','1/18', '1/6'], correctAnswer: '1/36' },
    { question: 'A bag contains 5 red balls and 3 blue balls. What is the probability of drawing a blue ball?', choices: ['3/8', '5/8', '1/2', '3/5'], correctAnswer: '3/8' },
    { question: 'What is the probability of drawing an ace from a standard deck of cards?', choices: ['1/52', '4/52', '1/13', '1/26'], correctAnswer: '4/52' },
    { question: 'If you roll a six-sided die, what is the probability of rolling an even number?', choices: ['1/2', '1/3', '1/6', '2/3'], correctAnswer: '1/2' },
    { question: 'A spinner has 4 equal sections numbered 1 to 4. What is the probability of landing on a number greater than 2? ', choices: ['1/4', '1/2', '3/4', '1/3'], correctAnswer: '3/4' },
    { question: 'If a standard die is rolled twice, what is the probability of getting a 5 on both rolls?', choices: ['1/6', '1/36', '1/12', '1/18'], correctAnswer: '1/36' },
    { question: 'What is the probability of drawing a queen from a standard deck of cards?', choices: ['1/13', '1/52', '1/4', '4/52'], correctAnswer: '1/13' },
  ],
  
};

// Insert data into the Questions collection
const insertQuestions = async () => {
  try {
    for (const subject in questionsData) {
      for (const questionData of questionsData[subject]) {
        const question = new Question({
          subject: subject,
          grade: '10th', // Specifying that all questions are for 10th grade
          ...questionData
        });
        await question.save();
      }
    }
    console.log('Questions inserted successfully');
  } catch (error) {
    console.error('Error inserting questions:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Run the insertion
insertQuestions();
