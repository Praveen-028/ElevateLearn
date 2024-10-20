const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const MONGO_URI = 'mongodb+srv://elevatelearnadmin:123Admin@elevatelearn.wptmq.mongodb.net/?retryWrites=true&w=majority&appName=Elevatelearn';

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the schema for subjects
const SubjectSchema = new mongoose.Schema({
  grade: {
    type: String,
    required: true,
  },
  subjects: {
    type: [String],
    required: true,
  },
});

// Create a model from the schema
const Subject = mongoose.model('Subject', SubjectSchema);

// Data to be inserted
const subjectsData = [
  {
    grade: "10th",
    subjects: ["English", "Tamil", "Maths", "Science", "SocialScience"],
  },
  {
    grade: "12th-CS",
    subjects: ["Tamil", "English", "Maths", "Chemistry", "Physics", "ComputerScience"],
  },
  {
    grade: "12th-Bio",
    subjects: ["Tamil", "English", "Maths", "Chemistry", "Physics", "Biology"],
  },
];

// Insert data into the Subjects collection
const insertSubjects = async () => {
  try {
    await Subject.insertMany(subjectsData);
    console.log('Subjects inserted successfully');
  } catch (error) {
    console.error('Error inserting subjects:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Run the insertion
insertSubjects();
