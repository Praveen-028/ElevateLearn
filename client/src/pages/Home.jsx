import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie'; // If you're using cookies

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in
    const checkSession = () => {
      const token = localStorage.getItem("token"); // or use sessionStorage or Cookies
      // const token = Cookies.get("token"); // Uncomment if using cookies
      if (token) {
        // Redirect to dashboard if user is logged in
        navigate("/dashboard");
      }
    };

    checkSession();
  }, [navigate]);

  return <h1>Home PAGE</h1>;
};

export default Home;
