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
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); // Prevent default form submission
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
    <div className="profile-container">
      <h1>User Profile</h1>
      {loading ? (
        <p>Loading...</p> // Show loading message while fetching profile
      ) : error ? (
        <p className="error-message">{error}</p> // Display error message if any
      ) : (
        <div className="profile-info">
          <div className="info-field">
            <strong>Username:</strong> {userProfile.username || 'N/A'}
          </div>
          <div className="info-field">
            <strong>Email:</strong> {userProfile.email || 'N/A'}
          </div>
          <div className="info-field">
            <strong>Date of Birth:</strong> {userProfile.dob ? new Date(userProfile.dob).toLocaleDateString() : 'N/A'}
          </div>
          <div className="info-field">
            <strong>Current Grade:</strong> {userProfile.currentGrade || 'N/A'}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <div className="form-group">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Current Grade:</label>
                <input
                  type="text"
                  value={currentGrade}
                  onChange={(e) => setCurrentGrade(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-button">Update Profile</button>
              <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
            </form>
          ) : (
            <button className="edit-button" onClick={handleEdit}>Edit Profile</button>
          )}
          
          {successMessage && <div className="success-message">{successMessage}</div>}
        </div>
      )}

      <div className="button-container">
        {/* Logout Button */}
        <button className="logout-button" onClick={handleLogout}>Logout</button>

        {/* Profile Navigation */}
        <button className="navigate-btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Profile;
