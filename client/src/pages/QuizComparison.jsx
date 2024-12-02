// QuizComparison.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './comparison.css'; 
import ScoreDifferenceChart from './ScoreDifferenceChart'; // Import the chart component

const QuizComparison = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
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
      }
    };

    fetchSubjects();
  }, [navigate]);

  const fetchQuizComparison = async (subject) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:4000/getQuizComparison?subject=${subject}`, { withCredentials: true });
      if (!response.data.status) {
        setError("Failed to fetch comparison data.");
        return;
      }
      if (response.data.latestQuiz && response.data.previousQuiz) {
        setComparison(response.data);
      } else {
        setError("No comparison data available.");
      }
    } catch (error) {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelection = (subject) => {
    setSelectedSubject(subject);
    fetchQuizComparison(subject);
  };

  return (
    <div className="scrolling-background">  
    <div className="quiz-comparison-page">
      <h2 className="quiz-comparison-title">Statistics</h2>
      <div className="quiz-comparison-container">
        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <>
            {!selectedSubject ? (
              <div className="subject-selection-container">
                <h2 className="subject-selection-title">Select a Subject to Compare:</h2>
                <div className="subject-grid">
                  {subjects.map((subject) => (
                    <div 
                      key={subject} 
                      className="subject-card" 
                      onClick={() => handleSubjectSelection(subject)}
                    >
                      <h3 className="subject-card-title">{subject}</h3>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="comparison-content">
                <div className="chart-container">
                  <ScoreDifferenceChart 
                    latestScore={comparison.latestQuiz.score} 
                    previousScore={comparison.previousQuiz.score} 
                  />
                </div>
                <div className="score-difference-container">
                  <h2 className="comparison-title">{selectedSubject} - Quiz Comparison</h2>
                  <div className="quiz-details">
                    <h3 className="quiz-header">Latest Quiz:</h3>
                    <p>Score: {comparison.latestQuiz.score} / {comparison.latestQuiz.totalQuestions}</p>
                    <p>Date: {new Date(comparison.latestQuiz.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="quiz-details">
                    <h3 className="quiz-header">Previous Quiz:</h3>
                    <p>Score: {comparison.previousQuiz.score} / {comparison.previousQuiz.totalQuestions}</p>
                    <p>Date: {new Date(comparison.previousQuiz.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="score-difference">
                    <h3>Score Difference:</h3>
                    {comparison.scoreDifference > 0 ? (
                      <p className="improved">Improved by {comparison.scoreDifference} points.</p>
                    ) : comparison.scoreDifference < 0 ? (
                      <p className="declined">Dropped by {Math.abs(comparison.scoreDifference)} points.</p>
                    ) : (
                      <p>No change in score.</p>
                    )}
                  </div>
                  <button className="back-button" onClick={() => setSelectedSubject(null)}>Back to Subject Selection</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default QuizComparison;
