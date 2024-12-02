import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie"; // If using cookies for token storage
import './Dashboard.css'; // Assuming you have a CSS file for styling

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [statistics, setStatistics] = useState({ totalQuizzes: 0, averageScore: 0 });

  useEffect(() => {
    const checkSession = () => {
      const token = Cookies.get("token"); // Assuming you're using cookies
      if (!token) {
        navigate("/login"); // Redirect to login if no token is found
      }
    };

    const fetchUsername = async () => {
      try {
        const response = await axios.get("http://localhost:4000/userextract", {
          withCredentials: true, // To include cookies in the request
        });

        if (response.data.status === false) {
          navigate("/login"); // If session is invalid, redirect to login
        } else {
          setUsername(response.data.user); // Set the username from the response
        }
      } catch (error) {
        console.error("Error fetching username", error);
        navigate("/login"); // Redirect to login on error
      } finally {
        setLoading(false); // Hide loading spinner
      }
    };

    const fetchStatistics = async () => {
      try {
        const response = await axios.get("http://localhost:4000/userstatistics", {
          withCredentials: true, // To include cookies in the request
        });

        if (response.data.status === false) {
          navigate("/login"); // If session is invalid, redirect to login
        } else {
          setStatistics({
            totalQuizzes: response.data.totalQuizzes,
            averageScore: response.data.averageScore,
          });
        }
      } catch (error) {
        console.error("Error fetching statistics", error);
        navigate("/login"); // Redirect to login on error
      }
    };

    checkSession();
    fetchUsername();
    fetchStatistics();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:4000/logout", {}, { withCredentials: true });

      Cookies.remove("token"); // Clear the token from cookies

      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  return (
    <div className="dashboard-container">
  {/* Sidebar */}
  <div className="dsidebar">
    <div className="welcome-message">Welcome, {username || 'User'}!</div>
    <div className="button-section">
      <button className="profile-btn" onClick={() => navigate('/profile')}>
        Profile
      </button>
      <button className="quiz-btn" onClick={() => navigate('/QuizPage')}>
        Take Quiz
      </button>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  </div>
  <div className="Naa">
  <h2>Dashboard</h2>
  {/* Main content (like stats, history, feedback) */}
  <div className="main-content">

    {/* User Statistics Section */}
    <div className="stats-section">
      <h2>Statistics</h2>
      <p className="insidestats">Total Quizzes Taken: {statistics.totalQuizzes}</p>
      <button className="quiz-comparison-button" onClick={() => navigate('/QuizComparison')}>
        <span className="arrow-icon">➔</span> {/* Right arrow icon */}
      </button>
    </div>

    {/* History Section */}
    <div className="stats-section">
      <h2>History</h2>
      <p>View the past quizzes</p>
      <button className="quiz-comparison-button" onClick={() => navigate('/quizresults')}>
        <span className="arrow-icon">➔</span>
      </button>
    </div>

    {/* Feedback Section */}
    <div className="stats-section">
      <h2>Feedback</h2>
      <p>View the past quizzes</p>
      <button className="quiz-comparison-button" onClick={() => navigate('/FeedbackPage')}>
        <span className="arrow-icon">➔</span>
      </button>
    </div>
    </div>
  </div>
</div>

  );
};

export default Dashboard;
