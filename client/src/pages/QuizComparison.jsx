import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './comparison.css'; // Ensure you have the appropriate styles

const QuizComparison = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState(null); // Handle error state

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = Cookies.get("token");
        console.log("Token:", token); // Check if the token exists

        if (!token) {
          navigate("/login");
          return; // Exit early if token is not found
        }

        const response = await axios.get("http://localhost:4000/getSubjects", { withCredentials: true });
        console.log("Response:", response.data); // Log the server response for debugging

        if (response.data.status) {
          setSubjects(response.data.subjects); // Assuming the backend sends a 'subjects' field with available subjects
        } else {
          console.error("Failed to fetch subjects:", response.data.message); // Log the error message
          navigate("/login"); // Redirect to login if fetching subjects fails
        }
      } catch (error) {
        console.error("Error fetching subjects", error);
        navigate("/login"); // Redirect on error
      }
    };

    fetchSubjects();
  }, [navigate]);

  const fetchQuizComparison = async (subject) => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await axios.get(`http://localhost:4000/getQuizComparison?subject=${subject}`, {
        withCredentials: true,
      });

      if (!response.data.status) {
        console.error("Failed to fetch quiz comparison:", response.data.message);
        return; // Do not redirect here; handle it gracefully
      }

      if (response.data.latestQuiz && response.data.previousQuiz) {
        setComparison(response.data);
      } else {
        setError("No comparison data available.");
      }
    } catch (error) {
      console.error("Error fetching quiz comparison", error);
      navigate("/login"); // Redirect on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelection = (subject) => {
    setSelectedSubject(subject);
    fetchQuizComparison(subject);
  };

  return (
    <div>
      <h1>Quiz Comparison</h1>
      <div className="quiz-comparison-container">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {!selectedSubject ? (
              <div className="subject-selection-grid">
                <h2>Select a subject to compare:</h2>
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
              <div className="comparison-content">
                <div className="comparison-card">
                  <h2>{selectedSubject} - Quiz Comparison</h2>

                  {comparison ? (
                    <>
                      <div className="quiz-details">
                        <h3>Latest Quiz:</h3>
                        <p>Score: {comparison?.latestQuiz?.score ?? "N/A"} / {comparison?.latestQuiz?.totalQuestions ?? "N/A"}</p>
                        <p>Date: {comparison?.latestQuiz?.createdAt ? new Date(comparison.latestQuiz.createdAt).toLocaleDateString() : "N/A"}</p>
                      </div>

                      <div className="quiz-details">
                        <h3>Previous Quiz:</h3>
                        <p>Score: {comparison?.previousQuiz?.score ?? "N/A"} / {comparison?.previousQuiz?.totalQuestions ?? "N/A"}</p>
                        <p>Date: {comparison?.previousQuiz?.createdAt ? new Date(comparison.previousQuiz.createdAt).toLocaleDateString() : "N/A"}</p>
                      </div>

                      <div className="score-difference">
                        <h3>Score Difference:</h3>
                        {comparison?.scoreDifference > 0 ? (
                          <p>Improved by {comparison.scoreDifference} points.</p>
                        ) : comparison?.scoreDifference < 0 ? (
                          <p>Dropped by {Math.abs(comparison.scoreDifference)} points.</p>
                        ) : (
                          <p>No change in score.</p>
                        )}
                      </div>
                    </>
                  ) : error ? (
                    <p>{error}</p>
                  ) : (
                    <p>No comparison data available.</p>
                  )}

                  <button className="back-btn" onClick={() => setSelectedSubject(null)}>
                    Back to Subject Selection
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizComparison;
