import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });
  const { email, password } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
    });

  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-left",
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        // Check if admin credentials are provided
        if (email === "Admin" && password === "admin@123") {
          handleSuccess("Admin login successful");
          setTimeout(() => {
            navigate("/admin"); // Redirect to admin module
          }, 1000);
        } else {
          // Otherwise, proceed with regular user login
          const { data } = await axios.post(
            "http://localhost:4000/login",
            {
              ...inputValue,
            },
            { withCredentials: true }
          );
          const { success, message } = data;
          if (success) {
            handleSuccess(message);
            setTimeout(() => {
              navigate("/dashboard"); // Redirect to regular dashboard
            }, 1000);
          } else {
            handleError(message);
          }
        }
      } catch (error) {
        console.error(error);
        handleError("An error occurred. Please try again.");
      }
    
      // Reset input values after submission
      setInputValue({
        email: "",
        password: "",
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
          <div className="form-box login">
            <form onSubmit={handleSubmit}>
              <h2>Sign In</h2>
              <div className="input-box">
                <span className="icon"><i className='bx bx-envelope'></i></span>
                <input
                  type="text"
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
              <div className="remember-forget">
                <label><input type="checkbox" /> Remember me</label>
                <a href="#">Forget password?</a>
              </div>
              <button type="submit" className="btn">Sign In</button>
              <div className="login-register">
                <p>Don't have an account? <Link to="/signup" className="register-link">Sign up</Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
