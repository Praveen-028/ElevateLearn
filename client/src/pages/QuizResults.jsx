import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie"; // If using cookies for token storage
import './QuizResults.css'; // Import CSS for styling

const QuizResults = () => {
    const [loading, setLoading] = useState(true);
    const [quizResults, setQuizResults] = useState({});
    const [error, setError] = useState(null);
    const [selectedQuiz, setSelectedQuiz] = useState(null); // Track the selected quiz

    useEffect(() => {
        const fetchQuizResults = async () => {
            const token = Cookies.get("token");
            if (!token) {
                window.location.href = "/login";
                return;
            }

            try {
                const response = await axios.get("http://localhost:4000/quizresults", {
                    withCredentials: true, // Include cookies in the request
                });

                if (response.data.status) {
                    setQuizResults(response.data.results); // Set quiz results from response
                } else {
                    setError(response.data.message); // Set error message
                }
            } catch (err) {
                console.error("Error fetching quiz results", err);
                setError("Failed to fetch quiz results.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuizResults();
    }, []);

    const handleQuizClick = (quiz) => {
        setSelectedQuiz(quiz); // Set the selected quiz to display details
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const formattedTime = date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
        return { formattedDate, formattedTime }; // Return formatted date and time as an object
    };

    return (
        <div className="quiz-results-container">
            <h1>Quiz Results</h1>
            {loading ? (
                <p>Loading...</p> // Show loading message while fetching results
            ) : error ? (
                <p className="error-message">{error}</p> // Display error message if any
            ) : selectedQuiz ? (
                <div className="quiz-details">
                    <h2>Quiz on {selectedQuiz.subject}</h2>
                    <p>Score: {selectedQuiz.score}/{selectedQuiz.totalQuestions}</p>
                    {/* Separate the date and time into distinct paragraphs */}
                    {(() => {
                        const { formattedDate, formattedTime } = formatDateTime(selectedQuiz.createdAt);
                        return (
                            <>
                                <p>Attended On: {formattedDate}</p>
                                <p>Time: {formattedTime}</p>
                            </>
                        );
                    })()}
                    <h3>Questions:</h3>
                    <ul>
                        {selectedQuiz.questions.map((q, index) => (
                            <li key={index} className={`question ${q.isCorrect ? 'correct' : 'incorrect'}`}>
                                <p><strong>Question {index + 1}:</strong> {q.question}</p>
                                <p><strong>Your Answer:</strong> {q.userAnswer}</p>
                                <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                                <p><strong>Result:</strong> {q.isCorrect ? "Correct" : "Incorrect"}</p>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setSelectedQuiz(null)}>Back to Results</button>
                </div>
            ) : (
                <div className="results-list">
                    {Object.entries(quizResults).map(([subject, results]) => (
                        <div key={subject} className="subject-group">
                            <h2>{subject}</h2>
                            <hr className="subject-separator" />
                            <div className="card-container">
                                {results.map((quiz) => (
                                    <div
                                        key={quiz._id}
                                        className="quiz-card"
                                        onClick={() => handleQuizClick(quiz)} // Show quiz details on click
                                    >
                                        <h3>Quiz on {quiz.subject}</h3>
                                        <p>Score: {quiz.score}/{quiz.totalQuestions}</p>
                                        {/* Separate the date and time for the list view */}
                                        {(() => {
                                            const { formattedDate, formattedTime } = formatDateTime(quiz.createdAt);
                                            return (
                                                <>
                                                    <p>Attended On: {formattedDate}</p>
                                                    <p>Time: {formattedTime}</p>
                                                </>
                                            );
                                        })()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizResults;