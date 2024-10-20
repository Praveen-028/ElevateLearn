import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique IDs
import axios from 'axios'; // Import Axios for HTTP requests
import './TestPage.css'; // Import the CSS file

const TestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subject } = location.state; // Retrieve subject from the navigation state
  const [questions, setQuestions] = useState([]); // State to hold fetched questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(7200); // 2 hours in seconds
  const currentQuestion = questions[currentQuestionIndex];

  // Fetch questions from backend on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/questions`, {
          params: { subject }, // Pass the subject as a query parameter
        });
        setQuestions(response.data.questions); // Set the questions received from the backend
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    fetchQuestions();
  }, [subject]);

  // Countdown Timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      alert('Time is up!');
      handleSubmit(); // Automatically submit when time is up
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Warn when 5 minutes are left
  useEffect(() => {
    const alertTime = 5 * 60; // 5 minutes in seconds
    if (timeRemaining === alertTime) {
      alert('5 minutes remaining!');
    }
  }, [timeRemaining]);

  // Prevent back navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Display a confirmation dialog
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Disable right-click
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault(); // Prevent the context menu from opening
    };

    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const handleNext = () => {
    if (!selectedAnswer) {
      alert('Please answer the question before proceeding to the next one.');
      return;
    }

    // Save the current answer before navigating to the next question
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestionIndex]: selectedAnswer,
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1] || ''); // Retain the answer if user revisits
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      // Save the current answer before navigating to the previous question
      if (selectedAnswer) {
        setAnswers((prevAnswers) => ({
          ...prevAnswers,
          [currentQuestionIndex]: selectedAnswer,
        }));
      }

      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] || ''); // Retain the answer if user revisits
    }
  };

  const handleSubmit = () => {
    // Save the last selected answer
    if (selectedAnswer) {
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [currentQuestionIndex]: selectedAnswer,
      }));
    }

    // Check if all questions are answered
    for (let i = 0; i < questions.length; i++) {
      if (!answers[i]) {
        alert('Please answer all questions before submitting.');
        return; // Prevent submission if not all questions are answered
      }
    }

    const confirmation = window.confirm('Are you sure you want to submit your test?');
    if (confirmation) {
      // Calculate score
      const finalAnswers = { ...answers }; // Include all saved answers
      const score = questions.reduce((acc, question, index) => {
        if (finalAnswers[index] === question.correctAnswer) {
          return acc + 1;
        }
        return acc;
      }, 0);

      // Navigate to results page with score, questions, user answers, and attemptId
      navigate('/ResultsPage', {
        state: {
          score,
          totalQuestions: questions.length,
          questions, // Ensure questions are passed here
          userAnswers: finalAnswers, // Pass the final answers
          subject, // Include the subject here
        },
      });
    }
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="test-page-container">
      <header className="test-page-header">
        <h1>{subject} Quiz</h1>
        <div className="timer">
          <p>Time Remaining: {formatTime(timeRemaining)}</p>
        </div>
      </header>
      <div className="test-page-content">
        <div className="sidebar">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`sidebar-button ${answers[index] ? 'answered' : ''}`}
              onClick={() => {
                setCurrentQuestionIndex(index);
                setSelectedAnswer(answers[index] || '');
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="question-content">
          <h2>Question {currentQuestionIndex + 1}</h2>
          {currentQuestion && (
            <>
              <p>{currentQuestion.question}</p>
              {currentQuestion.choices.map((choice, index) => (
                <div key={index}>
                  <input
                    type="radio"
                    id={`choice-${index}`}
                    name="choice"
                    value={choice}
                    checked={selectedAnswer === choice}
                    onChange={() => setSelectedAnswer(choice)}
                  />
                  <label htmlFor={`choice-${index}`}>{choice}</label>
                </div>
              ))}
              <div className="navigation-buttons">
                {currentQuestionIndex > 0 && (
                  <button className="prev-button" onClick={handlePrev}>
                    Previous
                  </button>
                )}
                {!isLastQuestion && (
                  <button className="next-button" onClick={handleNext}>
                    Next
                  </button>
                )}
                {isLastQuestion && (
                  <button className="submit-button" onClick={handleSubmit}>
                    Submit
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
