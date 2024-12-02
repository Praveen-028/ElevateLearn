import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './Feedback.css';

// Register the necessary components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:4000/getSubjects", { withCredentials: true });
        if (response.data.status) {
          setSubjects(response.data.subjects);
        } else {
          navigate("/login");
        }
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [navigate]);

  const fetchQuizResults = async (subject) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:4000/getQuizResultts?subject=${subject}`, {
        withCredentials: true,
      });

      if (!response.data.status) {
        setError(response.data.message);
        return;
      }

      const { latestQuiz } = response.data;

      if (latestQuiz) {
        setQuizResults(latestQuiz);
        analyzeWeaknesses(latestQuiz.weaknesses);
      } else {
        setError("Latest quiz data is missing.");
      }
    } catch (error) {
      setError('An error occurred while fetching quiz results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeWeaknesses = async (weaknesses) => {
    const topicFrequency = {};

    weaknesses.forEach(topic => {
      topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
    });

    const weakTopics = Object.entries(topicFrequency)
      .filter(([_, count]) => count > 3)
      .map(([topic]) => topic);

    if (weakTopics.length > 0) {
      let feedbackMessage = `You are weak in the following topics:\n`;

      // Fetch material for each weak topic
      for (const topic of weakTopics) {
        try {
          const encodedTopic = encodeURIComponent(topic);
          const response = await axios.get(`http://localhost:4000/getMaterial?topic=${encodedTopic}`);
          if (response.data.status) {
            feedbackMessage += `${topic}: ${response.data.material.url}\n`;
          } else {
            feedbackMessage += `${topic}: No material found.\n`;
          }
        } catch (error) {
          feedbackMessage += `${topic}: Failed to fetch material.\n`;
        }
      }

      setFeedback(feedbackMessage);
    } else {
      setFeedback("You have no major weaknesses in the topics.");
    }
  };

  // Prepare data for Pie Chart
  const pieChartData = {
    labels: ['Correct Answers', 'Wrong Answers'],
    datasets: [
      {
        data: [
          quizResults?.score || 0,  // Score
          (quizResults?.totalQuestions - (quizResults?.score || 0)) || 0 // Remaining Questions
        ],
        backgroundColor: ['#4caf50', '#f44336'], // Green for score, Red for remaining questions
        hoverBackgroundColor: ['#388e3c', '#d32f2f'],
      },
    ],
  };

  // Render feedback with clickable links and line breaks
  const renderFeedback = (feedback) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return feedback.split('\n').map((line, index) => {
      const parts = line.split(urlRegex);
      return (
        <span key={index}>
          {parts.map((part, i) =>
            urlRegex.test(part) ? (
              <a key={i} href={part} target="_blank" rel="noopener noreferrer">
                {part}
              </a>
            ) : (
              part
            )
          )}
          <br />
        </span>
      );
    });
  };

  const handleSubjectSelection = (subject) => {
    setSelectedSubject(subject);
    fetchQuizResults(subject);
  };

  return (
    <div className="feedback-page-container">
      <h1>Feedback Page</h1>
      <div className="feedback-container">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {!selectedSubject ? (
              <div className="subject-selection-grid">
                <h2>Select a subject to get feedback:</h2>
                <div className="subject-grid">
                  {subjects.map((subject) => (
                    <div 
                      key={subject} 
                      className="subject-card" 
                      onClick={() => handleSubjectSelection(subject)}
                    >
                      <h3>{subject}</h3>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="feedback-content">
                <div className="feedback-left">
                  {/* Pie Chart */}
                  <div className="pie-chart-container">
                    <Pie data={pieChartData} />
                  </div>
                </div>
                <div className="feedback-right">
                  <div className="feedback-card">
                    <h2>{selectedSubject} - Feedback</h2>
                    <p>{renderFeedback(feedback)}</p>

                    {quizResults && (
                      <div className="quiz-results">
                        <h3>Your Quiz Results</h3>
                        <p>Score: {quizResults.score}/{quizResults.totalQuestions}</p>
                        <p>Total Questions: {quizResults.totalQuestions}</p>
                      </div>
                    )}

                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    
                    <button className="back-btn" onClick={() => setSelectedSubject(null)}>
                      Back to Subject Selection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
