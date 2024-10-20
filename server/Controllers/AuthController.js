const User = require("../Models/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const jwt = require('jsonwebtoken'); // Add this line
const bcrypt = require("bcryptjs");

module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username, createdAt } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const user = await User.create({ email, password, username, createdAt });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.Login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if(!email || !password ){
        return res.json({message:'All fields are required'})
      }
      const user = await User.findOne({ email });
      if(!user){
        return res.json({message:'Incorrect password or email' }) 
      }
      const auth = await bcrypt.compare(password,user.password)
      if (!auth) {
        return res.json({message:'Incorrect password or email' }) 
      }
       const token = createSecretToken(user._id);
       res.cookie("token", token, {
         withCredentials: true,
         httpOnly: false,
       });
       res.status(201).json({ message: "User logged in successfully", success: true });
       next()
    } catch (error) {
      console.error(error);
    }
  };

module.exports.userextract = async(req, res) => {
    const token = req.cookies.token;  // Extract token from cookies
    if (!token) {
      return res.json({ status: false });
    }
  
    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
      if (err) {
        return res.json({ status: false });
      } else {
        const user = await User.findById(data.id);
        if (user) {
          return res.json({user: user.username });  // Send back the username
        } else {
          return res.json({ status: false });
        }
      }
    });
  };
  module.exports.userProfile = async(req, res) => {
    const token = req.cookies.token;  // Extract token from cookies
    if (!token) {
      return res.json({ status: false });
    }

    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
      if (err) {
        return res.json({ status: false });
      } else {
        const user = await User.findById(data.id);
        if (user) {
          return res.json({
            status: true,
            user: {
              username: user.username,
              email: user.email,
              dob: user.dob,
              currentGrade: user.currentGrade
            }
          });  // Send back user information
        } else {
          return res.json({ status: false });
        }
      }
    });
};
module.exports.updateUserProfile = async (req, res) => {
    const token = req.cookies.token; // Extract token from cookies
    if (!token) {
        return res.json({ status: false });
    }

    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) {
            return res.json({ status: false });
        } else {
            const userId = data.id;
            const { dob, currentGrade } = req.body; // Expecting dob and currentGrade in the request body
            
            try {
                const updatedUser = await User.findByIdAndUpdate(
                    userId,
                    { dob, currentGrade },
                    { new: true } // Return the updated document
                );

                if (updatedUser) {
                    return res.json({
                        status: true,
                        message: "Profile updated successfully",
                        user: updatedUser
                    });
                } else {
                    return res.json({ status: false, message: "User not found" });
                }
            } catch (error) {
                console.error(error);
                return res.json({ status: false, message: "Error updating profile" });
            }
        }
    });
};
  module.exports.logout = async(req, res) => {
    res.clearCookie("token"); // Clear the authentication token cookie
    return res.status(200).json({ message: "Logged out successfully" });
  };
  
