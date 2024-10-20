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
  Science: [
    { question: 'What is H2O?', choices: ['Oxygen', 'Water', 'Hydrogen', 'Carbon'], correctAnswer: 'Water' },
    { question: 'What planet is known as the Red Planet?', choices: ['Earth', 'Mars', 'Jupiter', 'Venus'], correctAnswer: 'Mars' },
    { question: 'What gas do plants absorb from the atmosphere?', choices: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctAnswer: 'Carbon Dioxide' },
    { question: 'What is the chemical symbol for Gold?', choices: ['Au', 'Ag', 'Pb', 'Fe'], correctAnswer: 'Au' },
    { question: 'What organ is responsible for pumping blood in the human body?', choices: ['Liver', 'Heart', 'Lungs', 'Kidneys'], correctAnswer: 'Heart' },
    { question: 'What is the powerhouse of the cell?', choices: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'], correctAnswer: 'Mitochondria' },
    { question: 'What is the speed of light?', choices: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'], correctAnswer: '300,000 km/s' },
    { question: 'What is the basic unit of life?', choices: ['Atom', 'Molecule', 'Cell', 'Organ'], correctAnswer: 'Cell' },
    { question: 'What element does "O" represent on the periodic table?', choices: ['Osmium', 'Oxygen', 'Oganesson', 'Oganesson'], correctAnswer: 'Oxygen' },
    { question: 'What force keeps us on the ground?', choices: ['Friction', 'Gravity', 'Magnetism', 'Inertia'], correctAnswer: 'Gravity' },
  ],
  SocialScience: [
    { question: 'Who is known as the father of modern economics?', choices: ['Adam Smith', 'Karl Marx', 'John Maynard Keynes', 'David Ricardo'], correctAnswer: 'Adam Smith' },
    { question: 'Which ancient civilization is known for the concept of democracy?', choices: ['Egyptian', 'Mesopotamian', 'Greek', 'Roman'], correctAnswer: 'Greek' },
    { question: 'What is the capital of India?', choices: ['Mumbai', 'New Delhi', 'Bangalore', 'Chennai'], correctAnswer: 'New Delhi' },
    { question: 'Who wrote the Declaration of Independence?', choices: ['George Washington', 'Thomas Jefferson', 'Abraham Lincoln', 'John Adams'], correctAnswer: 'Thomas Jefferson' },
    { question: 'What movement aimed to end racial segregation in the United States?', choices: ['Civil Rights Movement', 'Suffrage Movement', 'Labor Movement', 'Anti-war Movement'], correctAnswer: 'Civil Rights Movement' },
    { question: 'What is the primary purpose of the United Nations?', choices: ['To promote peace and security', 'To regulate trade', 'To establish a world government', 'To create a global currency'], correctAnswer: 'To promote peace and security' },
    { question: 'Which document serves as the supreme law of the United States?', choices: ['The Bill of Rights', 'The Constitution', 'The Declaration of Independence', 'The Articles of Confederation'], correctAnswer: 'The Constitution' },
    { question: 'What is the largest continent?', choices: ['Africa', 'Asia', 'Europe', 'North America'], correctAnswer: 'Asia' },
    { question: 'What is the primary religion in India?', choices: ['Hinduism', 'Islam', 'Christianity', 'Buddhism'], correctAnswer: 'Hinduism' },
    { question: 'Which country is known as the Land of the Rising Sun?', choices: ['China', 'Japan', 'Korea', 'Thailand'], correctAnswer: 'Japan' },
  ],
  Tamil: [
    { question: 'What is the capital of Tamil Nadu?', choices: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'], correctAnswer: 'Chennai' },
    { question: 'Who is known as the father of Tamil literature?', choices: ['Thiruvalluvar', 'Kambar', 'Subramania Bharathi', 'Auvaiyar'], correctAnswer: 'Thiruvalluvar' },
    { question: 'Which festival is celebrated as the harvest festival in Tamil Nadu?', choices: ['Pongal', 'Diwali', 'Holi', 'Christmas'], correctAnswer: 'Pongal' },
    { question: 'What is the official language of Tamil Nadu?', choices: ['Tamil', 'Telugu', 'Kannada', 'Malayalam'], correctAnswer: 'Tamil' },
    { question: 'Who was the first Chief Minister of Tamil Nadu?', choices: ['M. Karunanidhi', 'J. Jayalalithaa', 'M. G. Ramachandran', 'O. Panneerselvam'], correctAnswer: 'M. Karunanidhi' },
    { question: 'Which is the longest river in Tamil Nadu?', choices: ['Kaveri', 'Vaigai', 'Godavari', 'Periyar'], correctAnswer: 'Kaveri' },
    { question: 'What is the traditional dress of Tamil Nadu?', choices: ['Saree', 'Lungi', 'Dhoti', 'All of the above'], correctAnswer: 'All of the above' },
    { question: 'Who composed the Tamil epic "Kamba Ramayanam"?', choices: ['Kambar', 'Thiruvalluvar', 'Kalidasa', 'Siddhars'], correctAnswer: 'Kambar' },
    { question: 'What is the ancient Tamil text that deals with ethics and morality?', choices: ['Thirukkural', 'Silappathikaram', 'Manimekalai', 'Purananuru'], correctAnswer: 'Thirukkural' },
    { question: 'Which dance form originated in Tamil Nadu?', choices: ['Bharatanatyam', 'Kathak', 'Odissi', 'Kuchipudi'], correctAnswer: 'Bharatanatyam' },
  ],
  English: [
    { question: 'What is the synonym of "happy"?', choices: ['Sad', 'Joyful', 'Angry', 'Bored'], correctAnswer: 'Joyful' },
    { question: 'What is the antonym of "difficult"?', choices: ['Easy', 'Hard', 'Challenging', 'Complex'], correctAnswer: 'Easy' },
    { question: 'Which is the correct past tense of "go"?', choices: ['Go', 'Gone', 'Went', 'Going'], correctAnswer: 'Went' },
    { question: 'What is the meaning of "benevolent"?', choices: ['Cruel', 'Kind', 'Selfish', 'Indifferent'], correctAnswer: 'Kind' },
    { question: 'Which word is a noun?', choices: ['Quickly', 'Beautiful', 'Happiness', 'Run'], correctAnswer: 'Happiness' },
    { question: 'What is the plural of "child"?', choices: ['Childs', 'Children', 'Childes', 'Childer'], correctAnswer: 'Children' },
    { question: 'Which sentence is correct?', choices: ['He go to school.', 'He goes to school.', 'He going to school.', 'He gone to school.'], correctAnswer: 'He goes to school.' },
    { question: 'What is the main verb in the sentence "She is running"?', choices: ['She', 'Is', 'Running', 'None of the above'], correctAnswer: 'Running' },
    { question: 'Which punctuation mark is used to ask a question?', choices: ['.', '!', '?', ','], correctAnswer: '?' },
    { question: 'What is a synonym for "fast"?', choices: ['Quick', 'Slow', 'Steady', 'Calm'], correctAnswer: 'Quick' },
  ]
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
