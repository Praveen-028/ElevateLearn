const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel'); // Ensure the path is correct
const QuizResult = require('../Models/QuizResult'); // Ensure the path is correct

module.exports.storeQuizResults = async (req, res) => {
  const token = req.cookies.token; // Extract token from cookies
  if (!token) {
    return res.status(401).json({ status: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.TOKEN_KEY, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: false, message: "Invalid or expired token" });
    }

    const userId = decoded.id; // Extract user ID from decoded token
    const { subject, score, totalQuestions, questions } = req.body;

    // Identify weaknesses based on incorrect answers
    const weaknesses = questions
      .filter(question => question.correctAnswer !== question.userAnswer)
      .map(question => question.topics);

    // Prepare quiz result data
    const quizResultData = {
      userId,
      subject,
      score,
      totalQuestions,
      weaknesses, // Add weaknesses to the data
      questions: questions.map((question) => ({
        question: question.question,
        topics: question.topics,
        correctAnswer: question.correctAnswer,
        userAnswer: question.userAnswer,
        isCorrect: question.correctAnswer === question.userAnswer,
      })),
    };

    try {
      // Save the quiz result in the database
      const quizResult = new QuizResult(quizResultData);
      await quizResult.save();

      return res.status(201).json({ status: true, message: 'Quiz results submitted successfully.' });
    } catch (error) {
      console.error('Error saving quiz result:', error);
      return res.status(500).json({ status: false, message: 'Failed to submit quiz results.' });
    }
  });
};


module.exports.compareQuizResultsBySubject = async (userId) => {
  try {
    // Fetch all quiz results for the user
    const quizzes = await QuizResult.find({ userId }).sort({ createdAt: -1 }); // Sort by latest quiz first

    // Group quizzes by subject
    const groupedQuizzes = quizzes.reduce((acc, quiz) => {
      if (!acc[quiz.subject]) {
        acc[quiz.subject] = [];
      }
      acc[quiz.subject].push(quiz);
      return acc;
    }, {});

    // Prepare the comparison results
    const comparisonResults = {};

    for (const subject in groupedQuizzes) {
      const quizzesBySubject = groupedQuizzes[subject];

      // Only consider the latest and previous quizzes if they exist
      if (quizzesBySubject.length >= 2) {
        const latestQuiz = quizzesBySubject[0];
        const previousQuiz = quizzesBySubject[1];
        
        const improvement = latestQuiz.score - previousQuiz.score;

        comparisonResults[subject] = {
          latestScore: latestQuiz.score,
          previousScore: previousQuiz.score,
          improvement: improvement > 0 ? `Improved by ${improvement} points` : (improvement < 0 ? `Dropped by ${Math.abs(improvement)} points` : "No change in performance"),
        };
      } else {
        comparisonResults[subject] = {
          latestScore: quizzesBySubject[0].score,
          previousScore: null,
          improvement: "No previous quiz to compare",
        };
      }
    }

    return comparisonResults;
  } catch (error) {
    console.error("Error comparing quiz results:", error);
    throw new Error("Could not compare quiz results.");
  }
};



// In your UserController or QuizController
module.exports.getUserStatistics = async (req, res) => {
    const token = req.cookies.token; // Extract token from cookies
    if (!token) {
      return res.status(401).json({ status: false, message: "No token provided" });
    }
  
    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
      if (err) {
        return res.status(403).json({ status: false, message: "Invalid token" });
      }
  
      const userId = data.id;
  
      try {
        // Fetch quiz results directly from the QuizResult model
        const results = await QuizResult.find({ userId });
  
        // Calculate statistics
        const totalQuizzes = results.length;
        const averageScore = totalQuizzes > 0 
          ? results.reduce((acc, result) => acc + result.score, 0) / totalQuizzes 
          : 0;
  
        res.status(200).json({
          status: true,
          totalQuizzes,
          averageScore,
          quizResults: results,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Error fetching statistics" });
      }
    });
  };
 // Ensure this is the correct path to your QuizResult model

module.exports.getQuizStatistics = async (req, res) => {
  const token = req.cookies.token; // Extract token from cookies
  if (!token) {
    return res.status(401).json({ status: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.status(403).json({ status: false, message: "Invalid token" });
    }

    const userId = data.id;

    try {
      // Fetch quiz results for the user
      const results = await QuizResult.find({ userId });

      // Calculate total quizzes and average score
      const totalQuizzes = results.length;
      const averageScore = totalQuizzes > 0 
        ? results.reduce((acc, result) => acc + result.score, 0) / totalQuizzes 
        : 0;

      // Map quiz results to structure expected by frontend
      const quizzes = results.map(result => ({
        subject: result.subject,
        score: result.score,
        totalQuestions: result.totalQuestions,
      }));

      // Return statistics to the frontend
      res.status(200).json({
        status: true,
        totalQuizzes,
        averageScore,
        quizzes,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ status: false, message: "Error fetching statistics" });
    }
  });
};

// Assuming you're using Express and Mongoose
// quizController.js
module.exports.compareRecentQuizzesBySubject = async (req, res) => {
  const token = req.cookies.token; // Extract token from cookies
  if (!token) {
    return res.status(401).json({ status: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.status(403).json({ status: false, message: "Invalid token" });
    }

    const userId = data.id;

    try {
      // Fetch quiz results for the user, grouped by subject
      const results = await QuizResult.find({ userId }).sort({ createdAt: -1 });

      // Group results by subject
      const groupedQuizzes = results.reduce((acc, result) => {
        const subject = result.subject;
        if (!acc[subject]) {
          acc[subject] = [];
        }
        acc[subject].push(result);
        return acc;
      }, {});

      // Prepare response structure
      const quizzesForComparison = {};

      // Iterate over each subject to compare quizzes
      for (const subject in groupedQuizzes) {
        const quizzes = groupedQuizzes[subject];

        if (quizzes.length === 0) {
          continue; // No quizzes for this subject
        }

        if (quizzes.length === 1) {
          quizzesForComparison[subject] = {
            quizzes: quizzes,
            message: "Only one quiz available for comparison.",
            comparison: null // No comparison can be made
          };
        } else {
          quizzesForComparison[subject] = {
            quizzes: quizzes.slice(0, 2), // Last two quizzes
            comparison: {
              scoreDifference: quizzes[0].score - quizzes[1].score,
              totalQuestions: quizzes[0].totalQuestions,
            }
          };
        }
      }

      // Return the quizzes for comparison
      res.status(200).json({
        status: true,
        quizzes: quizzesForComparison,
      });
    } catch (error) {
      console.error("Error fetching quizzes for comparison:", error);
      res.status(500).json({ status: false, message: "Error fetching quizzes for comparison" });
    }
  });
};

module.exports.getQuizComparison = async (req, res) => {
  const token = req.cookies.token; // Get the token from the cookies
  if (!token) {
    return res.status(401).json({ status: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.status(403).json({ status: false, message: "Invalid token" });
    }

    const userId = data.id;
    const { subject } = req.query; // Expecting the subject to be passed as a query parameter

    try {
      // Fetch the two most recent quizzes of the given subject for the user
      const quizzes = await QuizResult.find({ userId, subject }).sort({ createdAt: -1 }).limit(2);

      if (quizzes.length < 2) {
        return res.status(404).json({ status: false, message: "Not enough quizzes to compare" });
      }

      const [latestQuiz, previousQuiz] = quizzes;

      const scoreDifference = latestQuiz.score - previousQuiz.score;

      // Send back the comparison data
      res.status(200).json({
        status: true,
        latestQuiz,
        previousQuiz,
        scoreDifference,
      });
    } catch (error) {
      console.error("Error fetching quiz comparison:", error);
      res.status(500).json({ status: false, message: "Error fetching quiz comparison" });
    }
  });
};

const Question = require('../Models/QuestionModel'); // Import the Question model

// Function to add a new question
module.exports.addQuestion = async (req, res) => {
  // Extract question data from the request body
  const { subject, grade, topics, question, choices, correctAnswer } = req.body; // Include 'topics'

  // Basic validation
  if (!subject || !grade || !topics || !question || !choices || !correctAnswer) { // Validate 'topics'
    return res.status(400).json({ status: false, message: "All fields are required." });
  }

  try {
    // Create a new question instance
    const newQuestion = new Question({
      subject,
      grade,
      topics, // Save 'topics'
      question,
      choices,
      correctAnswer,
    });

    // Save the question to the database
    await newQuestion.save();

    // Send a success response
    res.status(201).json({
      status: true,
      message: "Question added successfully",
      question: newQuestion,
    });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ status: false, message: "Error adding question" });
  }
};

module.exports.uploadQuestions = async (req, res) => {
  // Extract questions from the request body
  const { questions } = req.body;

  console.log("Received questions:", questions); // Debugging line

  // Basic validation
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ status: false, message: "Invalid questions format." });
  }

  try {
    // Validate each question
    const newQuestions = questions.map(q => {
      if (!q.subject || !q.grade || !q.question || !Array.isArray(q.choices) || !q.correctAnswer) {
        throw new Error("Invalid question format");
      }
      return new Question(q);
    });

    // Save all questions to the database in bulk
    await Question.insertMany(newQuestions);

    // Send a success response
    res.status(201).json({
      status: true,
      message: "Questions added successfully",
      questions: newQuestions,
    });
  } catch (error) {
    console.error("Error uploading questions:", error.message); // Improved error logging
    res.status(500).json({ status: false, message: "Error uploading questions" });
  }
};
 // Make sure to import your QuizResult model

 module.exports.getQuizResults = async (req, res) => {
  const token = req.cookies.token; // Extract token from cookies
  if (!token) {
    return res.status(401).json({ status: false, message: "No token provided" });
  }

  jwt.verify(token, process.env.TOKEN_KEY, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: false, message: "Invalid or expired token" });
    }

    const userId = decoded.id; // Extract user ID from decoded token
    const { subject } = req.query;

    try {
      // Fetch quiz results for the specific subject and sort by createdAt descending
      const quizResults = await QuizResult.find({ userId, subject }).sort({ createdAt: -1 });

      if (!quizResults.length) {
        return res.status(404).json({ status: false, message: 'No quiz results found for this subject.' });
      }

      // Return the latest quiz and, if available, the second latest quiz
      const latestQuiz = quizResults[0];
      const previousQuiz = quizResults[1] || null; // Set previousQuiz to null if it doesn't exist

      return res.status(200).json({
        status: true,
        latestQuiz,
        previousQuiz
      });
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      return res.status(500).json({ status: false, message: 'Failed to fetch quiz results.' });
    }
  });
};
