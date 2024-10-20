const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const Subjects = require('../Models/GradeModel');
const QuizResult = require('../Models/QuizResult');
const Question = require('../Models/QuestionModel'); // Adjust the path based on your project structure



module.exports.getSubjects = async (req, res) => {
  const token = req.cookies.token;  // Extract token from cookies
  if (!token) {
    console.log("No token found");
    return res.json({ status: false, message: "No token found" });
  }

  // Verify the JWT token to get the user ID
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      console.log("Invalid token");
      return res.json({ status: false, message: "Invalid token" });
    } else {
      try {
        // Fetch user information using the token's decoded data (user ID)
        const user = await User.findById(data.id);
        if (user) {
          const currentGrade = user.currentGrade; // Get user's current grade
          
          // Log the grade to verify it's extracted correctly
          console.log("User's current grade:", currentGrade);

          // Find the subjects document using the current grade
          const subjectsData = await Subjects.findOne({ grade: currentGrade });
          
          if (subjectsData) {
            console.log("Subjects found:", subjectsData.subjects);
            return res.json({
              status: true,
              subjects: subjectsData.subjects // Send back the subjects array
            });
          } else {
            console.log("No subjects found for the grade");
            return res.json({ status: false, message: "No subjects found for the grade" });
          }
        } else {
          console.log("User not found");
          return res.json({ status: false, message: "User not found" });
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        return res.status(500).json({ status: false, message: "Server Error" });
      }
    }
  });
};

// Import necessary modules
// Function to fetch quiz results grouped by subjects
module.exports.getQuizResults = async (req, res) => {
    const token = req.cookies.token; // Extract token from cookies
    if (!token) {
        return res.json({ status: false });
    }

    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) {
            return res.json({ status: false });
        } else {
            try {
                const quizResults = await QuizResult.find({ userId: data.id }).lean();
                const groupedResults = quizResults.reduce((acc, result) => {
                    const subject = result.subject;
                    if (!acc[subject]) {
                        acc[subject] = [];
                    }
                    acc[subject].push(result);
                    return acc;
                }, {});

                return res.json({
                    status: true,
                    results: groupedResults
                });
            } catch (error) {
                console.error("Error fetching quiz results", error);
                return res.json({ status: false, message: "Error fetching quiz results." });
            }
        }
    });
};

// Controller function to fetch quiz result by quizId
module.exports.getQuizResult = async (req, res) => {
    let quizId;

    if (req.method === 'GET') {
        quizId = req.query.quizId; // Get quizId from the query string in GET request
    } else if (req.method === 'POST') {
        quizId = req.body.quizId; // Get quizId from the request body in POST request
    }

    if (!quizId) {
        return res.status(400).json({ status: false, message: 'Quiz ID is required.' });
    }

    try {
        const quizDetail = await QuizResult.findOne({ quizAttemptId: quizId });

        if (!quizDetail) {
            return res.status(404).json({ status: false, message: 'Quiz result not found.' });
        }

        return res.status(200).json({
            status: true,
            quiz: {
                title: `Quiz on ${quizDetail.subject}`,
                description: `A quiz consisting of ${quizDetail.totalQuestions} questions.`,
                subject: quizDetail.subject,
                totalQuestions: quizDetail.totalQuestions,
                duration: 30, // Example duration
                questions: quizDetail.questions
            }
        });
    } catch (err) {
        console.error('Error fetching quiz details:', err.message); // Improved error logging
        return res.status(500).json({ status: false, message: 'Server error. Please try again later.' });
    }
};

// Define the route to get a specific quiz result using query parameters

module.exports.getQuestionsBySubject = async (req, res) => {
  const { subject } = req.query; // Extract subject from query parameters

  if (!subject) {
    return res.status(400).json({ status: false, message: 'Subject is required.' });
  }

  try {
    // Fetch questions from the database based on the subject
    const questions = await Question.find({ subject });

    if (questions.length === 0) {
      return res.status(404).json({ status: false, message: 'No questions found for this subject.' });
    }

    return res.status(200).json({
      status: true,
      questions: questions // Send back the questions array
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ status: false, message: 'Server error. Please try again later.' });
  }
};

const Feedback = require('../Models/FeedbackModel'); 
// Function to generate and store feedback
module.exports.storeFeedback = async (req, res) => {
  const { userId, quizId, feedback } = req.body;

  if (!userId) {
    return res.status(400).json({ status: false, message: 'User ID is required.' });
  }

  if (!quizId) {
    return res.status(400).json({ status: false, message: 'Quiz ID is required.' });
  }

  if (!feedback) {
    return res.status(400).json({ status: false, message: 'Feedback is required.' });
  }

  try {
    const newFeedback = new Feedback({ userId, quizId, feedback });
    await newFeedback.save();
    return res.status(201).json({ status: true, message: 'Feedback stored successfully.' });
  } catch (error) {
    console.error('Error storing feedback:', error);
    return res.status(500).json({ status: false, message: 'Server error. Please try again later.' });
  }
};
