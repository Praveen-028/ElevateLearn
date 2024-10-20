import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Instructions.css';

const Instructions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject } = location.state; // Retrieve the selected subject

  const [isAgreed, setIsAgreed] = useState(false);

  const handleTakeTest = () => {
    if (isAgreed) {
      // Pass the subject to the TestPage
      navigate('/TestPage', { state: { subject } });
    } else {
      alert('You must agree to the terms and conditions before starting the test.');
    }
  };

  return (
    <div className="instructions-container">
      <header className="instructions-header">
        <h1>Elevate Learn</h1>
      </header>
      <div className="instructions-content">
        <h2>Instructions for {subject}</h2>
        <p>Please read the instructions carefully before starting the test:</p>
        <ul className="instruction-list">
          <li>You will have one question on each page.</li>
          <li>Click "Next" to move to the next question.</li>
          <li>Select the correct answer from the four available options.</li>
          <li>Avoid any form of malpractice.</li>
        </ul>
        <div className="agree-section">
          <input
            type="checkbox"
            id="agreeTerms"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
          />
          <label htmlFor="agreeTerms"> I agree to the terms and conditions.</label>
        </div>
        <button className="take-test-button" onClick={handleTakeTest} disabled={!isAgreed}>
          Take Test
        </button>
      </div>
      <footer className="instructions-footer">
        <p>&copy; 2024 Elevate Learn. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Instructions;
