const User = require("../models/User");
const CryptoJS = require("crypto-js");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

// CREATE USER (ADMIN)
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const { username, email, password, isAdmin = false } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email, and password are required." });
  }

  const newUser = new User({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: CryptoJS.AES.encrypt(password, process.env.PASS_SEC).toString(),
    isAdmin: Boolean(isAdmin),
  });

  try {
    const savedUser = await newUser.save();
    const safeUser = savedUser.toObject();
    delete safeUser.password;
    res.status(201).json(safeUser);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Username or email already exists." });
    }
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  const update = {
    username: req.body.username,
    email: req.body.email,
  };

  if (req.body.password) {
    update.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }

  if (req.user.isAdmin && typeof req.body.isAdmin === "boolean") {
    update.isAdmin = req.body.isAdmin;
  }

  Object.keys(update).forEach((key) => {
    if (update[key] === undefined) delete update[key];
  });

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: update,
      },
      { new: true, runValidators: true }
    );
    if (!updatedUser) return res.status(404).json({ message: "User not found." });
    const safeUser = updatedUser.toObject();
    delete safeUser.password;
    res.status(200).json(safeUser);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Username or email already exists." });
    }
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found." });
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL USER
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    const safeUsers = users.map((user) => {
      const data = user.toObject();
      delete data.password;
      return data;
    });
    res.status(200).json(safeUsers);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER STATS

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
