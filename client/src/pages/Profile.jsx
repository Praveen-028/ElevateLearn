import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie"; // If using cookies for token storage
import './Profile.css'; // Import CSS for styling

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({});
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
  const [dob, setDob] = useState(""); // State for date of birth
  const [currentGrade, setCurrentGrade] = useState(""); // State for current grade
  const [successMessage, setSuccessMessage] = useState(""); // For success messages after update
  const [ageError, setAgeError] = useState(""); // State for age validation error
  const [dobError, setDobError] = useState(""); // State for DOB validation error

  useEffect(() => {
    const checkSession = () => {
      const token = Cookies.get("token"); // Assuming you're using cookies
      if (!token) {
        navigate("/login"); // Redirect to login if no token is found
      }
    };

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:4000/userprofile", {
          withCredentials: true, // To include cookies in the request
        });

        if (response.data.status === false) {
          navigate("/login"); // If session is invalid, redirect to login
        } else {
          setUserProfile(response.data.user); // Set user profile from response
          setDob(response.data.user.dob ? new Date(response.data.user.dob).toISOString().split("T")[0] : ""); // Set initial DOB
          setCurrentGrade(response.data.user.currentGrade || ""); // Set initial grade
        }
      } catch (error) {
        console.error("Error fetching user profile", error);
        setError("Failed to fetch user profile."); // Set error state
        navigate("/login"); // Redirect to login on error
      } finally {
        setLoading(false); // Hide loading spinner
      }
    };

    checkSession();
    fetchUserProfile();
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

  const handleEdit = () => {
    setIsEditing(true); // Set editing mode
    setAgeError(""); // Reset age error when editing starts
    setDobError(""); // Reset DOB error when editing starts
  };

  const validateDob = () => {
    const birthDate = new Date(dob);
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate()); // 17 years ago
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate()); // 13 years ago

    if (birthDate > today) {
      setDobError("Date of Birth cannot be in the future.");
      return false;
    }

    if (currentGrade === "10th" && (birthDate < minDate || birthDate > maxDate)) {
      setDobError("For 10th grade, age must be between 13 and 15. Adjust DOB accordingly.");
      return false;
    } else if ((currentGrade === "12th-Bio" || currentGrade === "12th-CS") && (birthDate < minDate || birthDate > new Date(today.getFullYear() - 15, today.getMonth(), today.getDate()))) {
      setDobError("For 12th grade, age must be between 15 and 17. Adjust DOB accordingly.");
      return false;
    }

    setDobError(""); // Clear DOB error if valid
    return true;
  };

  const validateAge = (grade) => {
    if (!dob) return; // Skip validation if DOB is not set

    const birthDate = new Date(dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const monthDiff = new Date().getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && new Date().getDate() < birthDate.getDate())) {
      age--; // Adjust age if the birthday hasn't occurred this year
    }

    // Validate age based on selected grade
    if (grade === "10th" && (age < 13 || age > 15)) {
      setAgeError("Age must be between 13 and 15 for 10th grade.");
    } else if (grade === "12th-Bio" && (age < 15 || age > 17)) {
      setAgeError("Age must be between 15 and 17 for 12th-Bio.");
    } else if (grade === "12th-CS" && (age < 15 || age > 17)) {
      setAgeError("Age must be between 15 and 17 for 12th-CS.");
    } else {
      setAgeError(""); // Clear error if age is valid
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Validate DOB and Age before submission
    if (!validateDob() || ageError) return; // Prevent submission if there's an age error

    try {
      const response = await axios.patch(
        "http://localhost:4000/updateuserprofile", // Adjust the endpoint as necessary
        { dob, currentGrade },
        { withCredentials: true }
      );

      if (response.data.status === true) {
        setSuccessMessage(response.data.message); // Show success message
        setUserProfile(prev => ({
          ...prev,
          dob,
          currentGrade
        }));
        setIsEditing(false); // Exit editing mode
      } else {
        setError(response.data.message); // Show error message
      }
    } catch (err) {
      console.error("Error updating profile", err);
      setError("An error occurred while updating the profile.");
    }
  };

  return (
    <div className="Profile-container">
    <div className="user-profile-container">
    <div class="user-profile-title-container">
  <h2 class="user-profile-title">User Profile </h2>
  <a class="user-profile-icon">👤</a>
</div>

      {loading ? (
        <p className="user-profile-loading">Loading...</p> // Show loading message while fetching profile
      ) : error ? (
        <p className="user-profile-error-message">{error}</p> // Display error message if any
      ) : (
        <div className="user-profile-info">
          <div className="user-profile-info-field">
            <strong>Username:</strong> {userProfile.username || 'N/A'}
          </div>
          <div className="user-profile-info-field">
            <strong>Email:</strong> {userProfile.email || 'N/A'}
          </div>
          <div className="user-profile-info-field">
            <strong>Date of Birth:</strong> {userProfile.dob ? new Date(userProfile.dob).toLocaleDateString() : 'N/A'}
          </div>
          <div className="user-profile-info-field">
            <strong>Current Grade:</strong> {userProfile.currentGrade || 'N/A'}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="user-profile-edit-form">
              <div className="user-profile-form-group">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    setAgeError(""); // Clear age error on DOB change
                    validateDob(); // Validate DOB when it's changed
                  }}
                  required
                  className="user-profile-input"
                />
                {dobError && <div className="user-profile-error-message">{dobError}</div>} {/* Show DOB error */}
              </div>
              <div className="user-profile-form-group">
                <label>Current Grade:</label>
                <select
                  value={currentGrade}
                  onChange={(e) => {
                    setCurrentGrade(e.target.value);
                    validateAge(e.target.value); // Validate age when grade changes
                  }}
                  required
                  className="user-profile-input"
                >
                  <option value="" disabled>Select your grade</option>
                  <option value="10th">10th</option>
                  <option value="12th-Bio">12th-Bio</option>
                  <option value="12th-CS">12th-CS</option>
                </select>
              </div>
              {ageError && <div className="user-profile-error-message">{ageError}</div>} {/* Show age error */}
              <button type="submit" className="user-profile-submit-button">Update Profile</button>
              <button type="button" className="user-profile-cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
            </form>
          ) : (
            <button className="user-profile-edit-button" onClick={handleEdit}>Edit Profile</button>
          )}

          {successMessage && <div className="user-profile-success-message">{successMessage}</div>}
        </div>
      )}

      <div className="user-profile-button-container">
        {/* Logout Button */}
        <button className="user-profile-logout-button" onClick={handleLogout}>Logout</button>

        {/* Profile Navigation */}
        <button className="user-profile-navigate-btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
    </div>
  );
};

export default Profile;
