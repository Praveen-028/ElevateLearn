import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './QuizDetails.css'; // Import CSS for styling

const QuizDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { quizId } = location.state || {}; // Retrieve quizId from the state passed from the previous page
    const [loading, setLoading] = useState(true);
    const [quizDetail, setQuizDetail] = useState(null);
    const [error, setError] = useState(null);
    const [usePostMethod, setUsePostMethod] = useState(true); // Toggle to choose between POST and GET

    useEffect(() => {
        const fetchQuizDetail = async () => {
            if (!quizId) {
                navigate('/quizresults'); // Redirect if no quizId is provided
                return;
            }
    
            console.log("Fetching quiz details for ID:", quizId); // Debugging line
    
            try {
                let response;
    
                if (usePostMethod) {
                    // Make a POST request and send quizId in the request body
                    response = await axios.post('http://localhost:4000/quizresult', {
                        quizId: quizId
                    });
                } else {
                    // Make a GET request and send quizId as a query parameter
                    response = await axios.get('http://localhost:4000/quizresult', {
                        params: { quizId }
                    });
                }
    
                if (response.data.status) {
                    setQuizDetail(response.data.quiz); // Set quiz details from response
                } else {
                    setError(response.data.message); // Set error message
                }
            } catch (err) {
                console.error("Error fetching quiz detail:", err.message); // Improved error logging
                setError(err.response?.data?.message || "Failed to fetch quiz detail."); // Improved error handling
            } finally {
                setLoading(false);
            }
        };
    
        fetchQuizDetail();
    }, [quizId, navigate, usePostMethod]);
    

    return (
        <div className="quiz-detail-container">
            {loading ? (
                <p>Loading...</p> // Show loading message while fetching details
            ) : error ? (
                <p className="error-message">{error}</p> // Display error message if any
            ) : (
                <div className="quiz-detail">
                    <h2>{quizDetail.title}</h2> {/* Display quiz title */}
                    <p>{quizDetail.description}</p> {/* Display quiz description */}
                    <div className="quiz-details">
                        <h2>Quiz Details:</h2>
                        <p>Subject: {quizDetail.subject}</p>
                        <p>Total Questions: {quizDetail.totalQuestions}</p>
                        <p>Duration: {quizDetail.duration} minutes</p>
                        {/* Additional quiz details as needed */}
                    </div>
                    <button onClick={() => navigate('/startquiz', { state: { quizId } })}>
                        Start Quiz
                    </button>
                    <button onClick={() => setUsePostMethod(!usePostMethod)}>
                        Toggle to {usePostMethod ? 'GET' : 'POST'} Method
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizDetails;
