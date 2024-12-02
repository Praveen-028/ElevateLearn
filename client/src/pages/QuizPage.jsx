import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './QuizPage.css';

const QuizPage = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);

  // Fetch subjects from the database when the component loads
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get("http://localhost:4000/getSubjects", { withCredentials: true });
        if (response.data.status) {
          // Assuming the response data structure is as provided
          setSubjects(response.data.subjects); // Get the subjects array directly
        } else {
          console.error('Failed to fetch subjects.');
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
  }, []);

  const handleStartQuiz = () => {
    if (selectedSubject) {
      navigate('/instructions', { state: { subject: selectedSubject } });
    } else {
      alert('Please select a subject to start the quiz.');
    }
  };

  return (
    <div className="quiz-page-container">
  <div className="quiz-page-content">
    <h2>Select a Subject for the Quiz</h2>
    <p>Please choose a subject from the dropdown below to begin your quiz.</p>
    <div className="quiz-page-dropdown-container">
      <select 
        onChange={(e) => setSelectedSubject(e.target.value)} 
        value={selectedSubject} 
        className="quiz-page-subject-dropdown"
      >
        <option value="">-- Select a Subject --</option>
        {subjects.length > 0 ? (
          subjects.map((subject, index) => (
            <option key={index} value={subject}>
              {subject}
            </option>
          ))
        ) : (
          <option value="" disabled>Loading subjects...</option>
        )}
      </select>
    </div>
    <button onClick={handleStartQuiz} className="quiz-page-start-button">
      Start Quiz
    </button>
    <footer className="quiz-page-footer">
      <p>&copy; 2024 Elevate Learn. All Rights Reserved.</p>
    </footer>
  </div>
</div>

  );
};

export default QuizPage;
