const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Load environment variables before importing routes that read them.
dotenv.config();

const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const stripeRoute = require("./routes/stripe");
const cors = require("cors");

const uploadsPath = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsPath, { recursive: true });

mongoose
  .connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log('DB Connection Successfull!'))
  .catch((err) => {
    console.error('DB connection failed. Check MongoDB Atlas Network Access.');
    console.error(err);
  });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsPath));
app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is unavailable. Check the MongoDB connection and try again.",
    });
  }
  next();
});
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/checkout", stripeRoute);

app.listen(process.env.PORT || 5000, () => {
  console.log("Backend server is running!");
});
