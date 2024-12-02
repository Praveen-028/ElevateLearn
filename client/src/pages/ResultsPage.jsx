import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import './ResultsPage.css'; // Import your CSS

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const todash = () => {
    navigate('/Dashboard');
  };

  const { score, totalQuestions, questions, userAnswers, subject } = location.state;

  // Group questions by topic
  const topics = {};
  questions.forEach((question, index) => {
    const topic = question.topic;
    if (!topics[topic]) {
      topics[topic] = { questions: [], wrongAnswers: 0 };
    }
    topics[topic].questions.push({
      question: question.question,
      userAnswer: userAnswers[index],
      correctAnswer: question.correctAnswer,
    });

    if (userAnswers[index] !== question.correctAnswer) {
      topics[topic].wrongAnswers++;
    }
  });

  // Initialize expandedTopics with all topics expanded by default
  const [expandedTopics, setExpandedTopics] = useState(
    Object.keys(topics).reduce((acc, topic) => {
      acc[topic] = true;
      return acc;
    }, {})
  );

  // Function to toggle topic expansion
  const toggleTopic = (topic) => {
    setExpandedTopics(prevState => ({
      ...prevState,
      [topic]: !prevState[topic] // Toggle the expanded state of the topic
    }));
  };

  const calculateWeaknesses = (questions) => {
    const tempWeaknesses = questions
      .filter(q => q.correctAnswer !== q.userAnswer)
      .map(q => q.topics);
    return [...new Set(tempWeaknesses)]; // Remove duplicates
  };

  const handleSubmitResults = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to submit results.');
      return;
    }

    const userId = "userId"; // Replace with actual user ID
    const weaknesses = calculateWeaknesses(questions);

    const formattedQuestions = questions.map((q, index) => ({
      question: q.question,
      topics: q.topic,
      correctAnswer: q.correctAnswer,
      userAnswer: userAnswers[index],
      isCorrect: q.correctAnswer === userAnswers[index],
    }));

    const resultData = {
      userId,
      subject,
      score,
      totalQuestions,
      weaknesses,
      questions: formattedQuestions,
    };

    try {
      const response = await fetch("http://localhost:4000/storequiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(resultData),
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data.message);
      } else {
        console.error("Error saving results:", data.message);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  // Identify weak topics (5 questions, 3 wrong)
  const weakTopics = Object.entries(topics).filter(
    ([, { questions, wrongAnswers }]) => questions.length >= 5 && wrongAnswers >= 3
  );

  return (
    <div className="results-page-container">
      <header className="results-page-header">
        <h2>{subject} Results</h2>
        <h2>Score: {score}/{totalQuestions}</h2>
      </header>
      <div className="results-content">
        <div className="topics-panel">
          <h3>Weak Topics</h3>
          {weakTopics.length === 0 ? (
            <p>No weak topics identified.</p>
          ) : (
            <ul>
              {weakTopics.map(([topic, { questions }]) => (
                <li key={topic}>
                  <h4>{topic}</h4>
                  <p>Questions answered incorrectly: {questions.filter(q => q.userAnswer !== q.correctAnswer).length}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="questions-summary">
          <h3>Questions Summary</h3>
          {Object.entries(topics).map(([topic, { questions }]) => (
            <div key={topic}>
              <h4
                onClick={() => toggleTopic(topic)} // Toggle on click
                style={{ cursor: 'pointer' }}
              >
                {topic} {expandedTopics[topic] ? '-' : '+'} {/* Show + or - based on expanded state */}
              </h4>
              {expandedTopics[topic] && ( // Conditionally render questions based on expanded state
                questions.map((item, index) => (
                  <div
                    key={index}
                    className={`question-item ${item.userAnswer === item.correctAnswer ? 'correct' : 'incorrect'}`}
                  >
                    <p><strong>Q: </strong>{item.question}</p>
                    <p><strong>Your Answer: </strong>{item.userAnswer}</p>
                    <p><strong>Correct Answer: </strong>{item.correctAnswer}</p>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleSubmitResults}>Submit the result</button>
      <button onClick={todash}>Back to Dashboard</button>
    </div>
  );
};

export default ResultsPage;
