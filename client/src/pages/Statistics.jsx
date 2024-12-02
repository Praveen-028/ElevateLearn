import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import './statistics.css'; // Ensure this is the correct path

const Statistics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({ totalQuizzes: 0, averageScore: 0, quizzes: [] });

  useEffect(() => {
    const checkSession = () => {
      const token = Cookies.get("token");
      if (!token) {
        navigate("/login");
      }
    };

    const fetchStatistics = async () => {
      try {
        const response = await axios.get("http://localhost:4000/quizstatistics", {
          withCredentials: true,
        });

        if (!response.data.status) {
          navigate("/login");
        } else {
          setStatistics({
            totalQuizzes: response.data.totalQuizzes,
            averageScore: response.data.averageScore,
            quizzes: response.data.quizzes || [], // Ensure quizzes is always an array
          });
        }
      } catch (error) {
        console.error("Error fetching statistics", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    fetchStatistics();
  }, [navigate]);

  // Group quizzes by subject
  const groupBySubject = (quizzes) => {
    const grouped = quizzes.reduce((acc, quiz) => {
      if (!acc[quiz.subject]) {
        acc[quiz.subject] = [];
      }
      acc[quiz.subject].push(quiz);
      return acc;
    }, {});
    return grouped;
  };

  // Compare the current quiz score with the previous one
  const compareWithPrevious = (quizzes) => {
    if (quizzes.length < 2) return "No previous quiz to compare";
    const latestQuiz = quizzes[quizzes.length - 1];
    const previousQuiz = quizzes[quizzes.length - 2];
    const improvement = latestQuiz.score - previousQuiz.score;
    if (improvement > 0) {
      return `Improved by ${improvement} points.`;
    } else if (improvement < 0) {
      return `Dropped by ${Math.abs(improvement)} points.`;
    } else {
      return "No change in performance.";
    }
  };

  const groupedQuizzes = groupBySubject(statistics.quizzes);

  return (
    <div className="statistics-container">
      <h2>Your Statistics</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="statistics-content">
          <div className="card stats-summary">
            <h3>Summary</h3>
            <p>Total Quizzes Taken: {statistics.totalQuizzes}</p>
            <p>
              Average Score: {statistics.totalQuizzes > 0 ? statistics.averageScore.toFixed(2) : 'N/A'}%
            </p>
          </div>

          <div className="card quizzes-list">
            <h3>Quiz Breakdown by Subject</h3>
            {Object.keys(groupedQuizzes).length > 0 ? (
              Object.keys(groupedQuizzes).map((subject, index) => (
                <div key={index} className="subject-group">
                  <h4>{subject}</h4>
                  <ul>
                    {groupedQuizzes[subject].map((quiz, quizIndex) => (
                      <li key={quizIndex}>
                        <p>
                          Quiz {quizIndex + 1} - {quiz.subject}: {quiz.score} / {quiz.totalQuestions}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <p>{compareWithPrevious(groupedQuizzes[subject])}</p>
                </div>
              ))
            ) : (
              <p>No quizzes taken yet.</p>
            )}
          </div>

          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default Statistics;
