import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TestPage.css'; // Import your CSS

const TestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { topics, subject } = location.state; // Retrieve subject and topics from navigation state
  const [questionsByTopic, setQuestionsByTopic] = useState([]); // State to hold questions organized by topic
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0); // Set initial time remaining

  // Fetch questions from backend on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/questions`, {
          params: { subject }, // Pass the subject as a query parameter
        });
        setQuestionsByTopic(response.data.questionsByTopic); // Set the questions received from the backend

        // Set dynamic time based on total number of questions
        const totalQuestions = response.data.questionsByTopic.flatMap(topic => topic.questions).length;
        setTimeRemaining(totalQuestions * 120); // 2 minutes (120 seconds) per question
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    fetchQuestions();
  }, [subject]);

  // Function to get the current question based on the global index
  const getCurrentQuestion = () => {
    if (questionsByTopic.length === 0) return null;

    const flatQuestions = questionsByTopic.flatMap(topic => topic.questions); // Flatten all questions into a single array
    return flatQuestions[currentQuestionIndex] || null;
  };

  const currentQuestion = getCurrentQuestion(); // Now, we can safely use this here

  // Countdown Timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      // alert('Time is up!');
      // handleSubmit(); // Automatically submit when time is up
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

  // Save current answer helper function
  const saveCurrentAnswer = () => {
    if (selectedAnswer) {
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [currentQuestionIndex]: selectedAnswer,
      }));
    }
  };

  // Handle Next button click
  const handleNext = () => {
    saveCurrentAnswer();
    const totalQuestions = questionsByTopic.flatMap(topic => topic.questions).length;
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1] || ''); // Retain the answer if user revisits
    }
  };

  // Handle Previous button click
  const handlePrev = () => {
    saveCurrentAnswer();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] || ''); // Retain the answer if user revisits
    }
  };

  // Handle Submit button click
  const handleSubmit = () => {
    // Save the last selected answer
    saveCurrentAnswer();

    // Check if all questions are answered
    const totalQuestions = questionsByTopic.flatMap(topic => topic.questions).length;
    for (let i = 0; i < totalQuestions; i++) {
      if (!answers[i]) {
        alert('Please answer all questions before submitting.');
        return; // Prevent submission if not all questions are answered
      }
    }

    const confirmation = window.confirm('Are you sure you want to submit your test?');
    if (confirmation) {
      // Calculate score
      const flatQuestions = questionsByTopic.flatMap(topic => topic.questions);
      const finalAnswers = { ...answers }; // Include all saved answers
      const score = flatQuestions.reduce((acc, question, index) => {
        if (finalAnswers[index] === question.correctAnswer) {
          return acc + 1;
        }
        return acc;
      }, 0);
      console.log('Data being passed to ResultsPage:', {
        score,
        totalQuestions: flatQuestions.length,
        questions: flatQuestions, // Ensure questions are passed here
        userAnswers: finalAnswers, // Pass the final answers
        subject, // Include the subject here
      });
      // Navigate to results page with score, questions, user answers, and attemptId
      navigate('/ResultsPage', {
        state: {
          score,
          totalQuestions: flatQuestions.length,
          questions: flatQuestions, // Ensure questions are passed here
          userAnswers: finalAnswers, // Pass the final answers
          subject, // Include the subject here
        },
      });
    }
  };

  // Dynamically determine if the current question is the last question
  const totalQuestions = questionsByTopic.flatMap(topic => topic.questions).length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Reset timer when questions are fetched
  useEffect(() => {
    if (questionsByTopic.length > 0 && timeRemaining === 0) {
      const totalQuestions = questionsByTopic.flatMap(topic => topic.questions).length;
      setTimeRemaining(totalQuestions * 120); // Reset timer for 2 minutes per question
    }
  }, [questionsByTopic]);

  return (
    <div className="test-page-container">
      <header className="test-page-header">
        <h2>{subject} Quiz - {questionsByTopic[Math.floor(currentQuestionIndex / 5)]?.topic || ''}</h2>
        <div className="test-page-timer">
          <p>Time Remaining: {formatTime(timeRemaining)}</p>
        </div>
      </header>
      <div className="test-page-content">
        <div className="test-page-sidebar">
          {questionsByTopic.map((topic, topicIndex) => (
            <div key={topicIndex}>
              <h3>{topic.topic}</h3>
              {topic.questions.map((_, questionIndex) => {
                const globalIndex = topicIndex * topic.questions.length + questionIndex; // Correct global index calculation
                return (
                  <button
                    key={globalIndex}
                    className={`test-page-sidebar-button ${answers[globalIndex] ? 'answered' : ''}`}
                    onClick={() => {
                      setCurrentQuestionIndex(globalIndex);
                      setSelectedAnswer(answers[globalIndex] || '');
                    }}
                  >
                    {globalIndex + 1} {/* Ensure numbering starts at 1 */}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="test-page-question-content">
          <h2>Question {currentQuestionIndex + 1}</h2>
          {currentQuestion && (
            <>
              <p>{currentQuestion.question}</p>
              
              {currentQuestion.choices.map((choice, index) => (
                <div key={index} className='Test-Choice'>
                  <input
                    type="radio"
                    id={`choice-${index}`}
                    name="choice"
                    className='forrr'
                    value={choice}
                    checked={selectedAnswer === choice}
                    onChange={() => setSelectedAnswer(choice)}
                  />
                  <label htmlFor={`choice-${index}`}>{choice}</label>
                </div>
              ))}
              <div className="test-page-navigation-buttons">
                {currentQuestionIndex > 0 && (
                  <button className="test-page-prev-button" onClick={handlePrev}>
                    Previous
                  </button>
                )}
                {currentQuestionIndex < totalQuestions - 1 && (
                  <button className="test-page-next-button" onClick={handleNext}>
                    Next
                  </button>
                )}
                {isLastQuestion && (
                  <button className="test-page-submit-button" onClick={handleSubmit}>
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
