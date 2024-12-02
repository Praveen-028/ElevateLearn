import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import './Login.css';

const Signup = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
  });
  const { email, password, username, confirmPassword } = inputValue;

  const [error, setError] = useState("");

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
    setError(""); // Clear error when user types
  };

  const handleError = (err) => 
    toast.error(err, {
      position: "bottom-left",
    });

  const handleSuccess = (msg) => 
    toast.success(msg, {
      position: "bottom-right",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      handleError("Passwords do not match.");
      return;
    }
    try {
      const { data } = await axios.post(
        "http://localhost:4000/signup",
        {
          email,
          password,
          username,
        },
        { withCredentials: true }
      );
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        // Redirect to login page instead of logging in directly
        setTimeout(() => {
          navigate("/login"); // Change this line
        }, 1000);
      } else {
        handleError(message);
      }
    } catch (error) {
      console.log(error);
      handleError("An error occurred. Please try again.");
    }
    setInputValue({
      email: "",
      password: "",
      username: "",
      confirmPassword: "",
    });
  };

  return (
    <div>
      <header className="header1">
        <nav className="navbar1">
        </nav>
        {/* <form className="search-bar">
          <input type="text" placeholder="Search..." />
          <button type="submit"><i className='bx bx-search'></i></button>
        </form> */}
      </header>

      <div className="background"></div>
      <div className="container">
        <div className="content">
          <h2 className="logo"><i className='bx bxl-firebase'></i>Elevate Learn</h2>
          <div className="text-sci">
            <h2>Welcome! <br /><span>To our new website.</span></h2>
            <p>Here are our teammates; we are representing the quiz for learners to improve.</p>
            <div className="social-icons">
              <a href="#"><i className='bx bxl-linkedin'></i></a>
              <a href="#"><i className='bx bxl-facebook-circle'></i></a>
              <a href="#"><i className='bx bxl-instagram'></i></a>
              <a href="#"><i className='bx bxl-twitter'></i></a>
            </div>
          </div>
        </div>

        <div className="logreg-box">
          <div className="form-box register">
            <form onSubmit={handleSubmit}>
              <h2>Register</h2>
              <div className="input-box">
                <span className="icon"><i className='bx bx-user'></i></span>
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={handleOnChange}
                  required
                />
                <label>Name</label>
              </div>
              <div className="input-box">
                <span className="icon"><i className='bx bx-envelope'></i></span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleOnChange}
                  required
                />
                <label>Email</label>
              </div>
              <div className="input-box">
                <span className="icon"><i className='bx bx-lock-alt'></i></span>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={handleOnChange}
                  required
                />
                <label>Password</label>
              </div>
              <div className="input-box">
                <span className="icon"><i className='bx bx-lock-alt'></i></span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleOnChange}
                  required
                />
                <label>Confirm Password</label>
              </div>
              <button type="submit" className="btn">Register</button>
              {error && <div className="error">{error}</div>}
              <div className="login-register">
                <p>Already have an account? <Link to="/login" className="register-link">Sign in</Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signup;
