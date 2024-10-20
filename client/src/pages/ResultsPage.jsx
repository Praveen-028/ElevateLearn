import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResultsPage.css';

// Function to send quiz results to the backend
const sendQuizResults = async (quizResults, setSuccessMessage, setError) => {
  try {
    const response = await fetch('http://localhost:4000/storequiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizResults),
      credentials: 'include', // Ensures cookies are sent with the request
    });

    // Check if the response is valid JSON
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (data.status) {
        setSuccessMessage('Quiz results stored successfully.');
      } else {
        setError(data.message || 'Failed to store quiz results.');
      }
    } else {
      setError('Invalid response format. Expected JSON.');
    }
  } catch (error) {
    console.error('Error sending quiz results:', error);
    setError('An error occurred while sending quiz results.');
  }
};

// Function to send feedback to the backend
const sendFeedback = async (feedbackData, setSuccessMessage, setError) => {
  try {
    const response = await fetch('http://localhost:4000/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
      credentials: 'include',
    });

    const data = await response.json();
    if (data.status) {
      setSuccessMessage('Feedback stored successfully.');
    } else {
      setError(data.message || 'Failed to store feedback.');
    }
  } catch (error) {
    setError('An error occurred while sending feedback.');
  }
};

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Destructure subject from location state
  const { score = 0, totalQuestions = 0, questions = [], userAnswers = {}, subject, userId } = location.state || {};

  const [successMessage, setSuccessMessage] = useState(''); // To display success messages
  const [error, setError] = useState(''); // To display error messages
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(''); // New state for feedback
  const [showFeedback, setShowFeedback] = useState(false);

  // Convert data into the format needed for submission
  useEffect(() => {
    const quizResults = {
      userId,
      subject: subject || 'Unknown',
      score,
      totalQuestions,
      questions: questions.map((question, index) => ({
        question: question.question,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswers[index] || 'No answer provided',
        isCorrect: userAnswers[index] === question.correctAnswer,
      })),
    };

    // Call the function to send quiz results
    const submitResults = async () => {
      await sendQuizResults(quizResults, setSuccessMessage, setError);
      setLoading(false); // Set loading to false after results submission
    };

    submitResults();
  }, [userId, questions, score, totalQuestions, subject, userAnswers]);

  // Function to generate feedback based on performance
  const generateFeedback = () => {
    const percentage = (score / totalQuestions) * 100;
    let feedbackMessage = '';

    if (percentage >= 90) {
      feedbackMessage = 'Excellent performance! Keep it up!';
    } else if (percentage >= 75) {
      feedbackMessage = 'Great job! You did really well.';
    } else if (percentage >= 50) {
      feedbackMessage = 'Good effort! A bit more practice would help.';
    } else {
      feedbackMessage = 'Keep practicing, and you will improve!';
    }

    setFeedback(feedbackMessage);
    setShowFeedback(true);
  };

  // Function to handle feedback submission
  const handleFeedbackSubmit = async () => {
    const feedbackData = {
      userId,
      quizId: location.state._id, // Assuming quiz ID is passed in location.state
      feedback,
    };

    await sendFeedback(feedbackData, setSuccessMessage, setError);
  };

  const handleRedirectToDashboard = () => {
    navigate('/dashboard'); // Redirect to dashboard
  };

  return (
    <div className="results-page-container">
      <header className="results-page-header">
        <h1>Test Results</h1>
      </header>

      {loading ? (
        <p>Submitting quiz results...</p>
      ) : (
        <>
          <div className="score-section">
            <p className="score-display">Your Score: {score} / {totalQuestions}</p>
          </div>

          <div className="results-scrollable-content">
            <ul className="results-list">
              {questions.map((question, index) => {
                const userAnswer = userAnswers[index] || 'No answer provided';
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <li
                    key={index}
                    className={`question-result ${isCorrect ? 'correct' : userAnswers[index] ? 'incorrect' : 'unanswered'}`}
                  >
                    <h3>Question {index + 1}:</h3>
                    <p><strong>Question:</strong> {question.question}</p>
                    <p>
                      <strong>Your Answer:</strong>
                      <span className={isCorrect ? 'correct' : userAnswers[index] ? 'incorrect' : 'unanswered'}>
                        {userAnswer}
                      </span>
                    </p>
                    <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Display error message if present */}
          {error && <p className="error-message">{error}</p>}
          {/* Display success message if results were submitted */}
          {successMessage && <p className="success-message">{successMessage}</p>}

          {/* Button to generate and display feedback */}
          <button onClick={generateFeedback} className="generate-feedback-button">
            View Feedback
          </button>

          {/* Display feedback if available */}
          {showFeedback && (
            <div className="feedback-section">
              <p><strong>Feedback:</strong> {feedback}</p>
              {/* Button to submit feedback */}
              <button onClick={handleFeedbackSubmit} className="submit-feedback-button">
                Submit Feedback
              </button>
            </div>
          )}

          {/* Button to redirect to the dashboard */}
          <button className="redirect-button" onClick={handleRedirectToDashboard}>
            Go to Dashboard
          </button>
        </>
      )}
    </div>
  );
};

export default ResultsPage;
