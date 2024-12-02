import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './Admin.css'; // Ensure this matches your CSS file name

const AddQuestion = () => {
  const navigate = useNavigate();
  const [inputValues, setInputValues] = useState({
    subject: "",
    grade: "",
    topics: "",
    question: "",
    choices: ["", "", "", ""],
    correctAnswer: "",
  });
  const [file, setFile] = useState(null);
  const [showFormat, setShowFormat] = useState(false); // State to control the format display

  const { subject, grade, topics, question, choices, correctAnswer } = inputValues;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("choice")) {
      const index = parseInt(name.split("-")[1]);
      const newChoices = [...choices];
      newChoices[index] = value;
      setInputValues({ ...inputValues, choices: newChoices });
    } else {
      setInputValues({ ...inputValues, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:4000/question",
        inputValues,
        { withCredentials: true }
      );
      const { data } = response;
      if (data.status) {
        toast.success(data.message);
        setInputValues({
          subject: "",
          grade: "",
          topics: "",
          question: "",
          choices: ["", "", "", ""],
          correctAnswer: "",
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Error adding question. Please try again.");
    }
  };

  const handleFileUploadSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target.result;
        const questions = JSON.parse(content);
        try {
          const response = await axios.post(
            "http://localhost:4000/upload-questions",
            { questions },
            { withCredentials: true }
          );
          const { data } = response;
          if (data.status) {
            toast.success(data.message);
            setFile(null);
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          console.error("Error uploading questions:", error);
          toast.error("Error uploading questions. Please try again.");
        }
      };
      reader.readAsText(file);
    } else {
      toast.error("Please select a file to upload.");
    }
  };

  // Function to handle redirect to login
  const redirectToLogin = () => {
    navigate("/login"); // Adjust the path to your login route
  };

  // Function to toggle the display of question format
  const toggleFormatDisplay = () => {
    setShowFormat(!showFormat);
  };

  return (
    <div className="add-question-container">
      <div className="welcome-message">
        <h2>Welcome Admin</h2>
      </div>

      <div className="flex-container"> {/* Flex container for layout */}
        <div className="manual-question-container"> {/* Left Container */}
          <h2>Add a New Question Manually</h2>
          <div className="scrollable-form">
            <form onSubmit={handleManualSubmit}>
              <div>
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Grade</label>
                <input
                  type="text"
                  name="grade"
                  value={grade}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Topic</label>
                <input
                  type="text"
                  name="topics"
                  value={topics}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Question</label>
                <textarea
                  name="question"
                  value={question}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="choices-container">
                <label>Choices</label>
                {choices.map((choice, index) => (
  <div key={index}>
    <input
      type="text"
      name={`choice-${index}`}  
      value={choice}
      onChange={handleInputChange}
      required
      placeholder={`Choice ${index + 1}`}  
    />
  </div>
))}

              </div>
              <div>
                <label>Correct Answer</label>
                <input
                  type="text"
                  name="correctAnswer"
                  value={correctAnswer}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit">Add Question Manually</button>
            </form>
          </div>
          {/* Toggle question format display */}
          
        </div>

        <div className="file-upload-container"> {/* Right Container */}
          <h2>Upload Questions File</h2>
          <div className="scrollable-form">
            <form onSubmit={handleFileUploadSubmit}>
              <div>
                <label>Upload Questions File</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <button type="submit">Upload Questions from File</button>
            </form>
          </div>
        </div>
      </div>

      {/* Redirect to Login Button */}
      <button onClick={redirectToLogin}>Go to Login</button>

      <ToastContainer />
    </div>
  );
};

export default AddQuestion;
