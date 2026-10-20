const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json("Username, email, and password are required");
  }

  const newUser = new User({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: CryptoJS.AES.encrypt(password, process.env.PASS_SEC).toString(),
  });

  try {
    const savedUser = await newUser.save();
    const { password: _, ...userWithoutPassword } = savedUser._doc;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json("Username or email already exists");
    }
    res.status(500).json(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  try {
    const username = req.body.username || req.body.user_name;
    const { password } = req.body;

    if (!username || !password) {
      return res.status(400).json("Username and password are required");
    }

    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(401).json("Wrong username or password");
    }

    const decryptedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    ).toString(CryptoJS.enc.Utf8);

    if (decryptedPassword !== password) {
      return res.status(401).json("Wrong username or password");
    }

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password: _, ...userWithoutPassword } = user._doc;
    res.status(200).json({ ...userWithoutPassword, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
