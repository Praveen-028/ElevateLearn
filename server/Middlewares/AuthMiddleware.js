const User = require("../Models/UserModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ status: false });
  }

  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.json({ status: false });
    } else {
      const user = await User.findById(data.id);
      if (user) {
        // Adding username and currentGrade to the cookies
        res.cookie('username', user.username, { httpOnly: true });
        res.cookie('currentGrade', user.currentGrade, { httpOnly: true });

        return res.json({ status: true, user: user.username, currentGrade: user.currentGrade });
      } else {
        return res.json({ status: false });
      }
    }
  });
};
