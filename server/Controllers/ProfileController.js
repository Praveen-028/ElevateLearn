const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");

module.exports.getProfile = async (req, res) => {
  const token = req.cookies.token;  // Extract token from cookies
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    } else {
      const user = await User.findById(data.id).select("username email currentGrade dob");
      if (user) {
        return res.status(200).json(user); // Send back the profile data
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    }
  });
};

module.exports.logout = (req, res) => {
  res.clearCookie("token"); // Clear the authentication token cookie
  return res.status(200).json({ message: "Logged out successfully" });
};

module.exports.updateProfile = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) return res.status(401).json({ error: "Unauthorized" });

    try {
      const { currentGrade, dob } = req.body;
      const user = await User.findById(data.id);
      if (user) {
        user.currentGrade = currentGrade || user.currentGrade;
        user.dob = dob || user.dob;
        await user.save();
        return res.status(200).json({ message: "Profile updated successfully" });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};
