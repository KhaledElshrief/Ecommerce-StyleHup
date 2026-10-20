const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});

//CREATE

router.post("/", verifyTokenAndAdmin, upload.single("image"), async (req, res) => {
  let categories = [];
  try {
    categories = req.body.categories ? JSON.parse(req.body.categories) : [];
  } catch {
    categories = String(req.body.categories || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const imageUrl = req.file
    ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    : req.body.img;

  const newProduct = new Product({
    ...req.body,
    img: imageUrl,
    categories,
    price: Number(req.body.price),
    inStock: req.body.inStock !== "false",
  });

  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Product title already exists." });
    }
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, upload.single("image"), async (req, res) => {
  try {
    let categories = req.body.categories;
    if (typeof categories === "string") {
      try {
        categories = JSON.parse(categories);
      } catch {
        categories = categories
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    const update = {
      ...req.body,
      ...(categories !== undefined ? { categories } : {}),
      ...(req.body.price !== undefined ? { price: Number(req.body.price) } : {}),
      ...(req.body.inStock !== undefined
        ? { inStock: req.body.inStock !== "false" }
        : {}),
    };

    if (req.file) {
      update.img = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: update,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Product title already exists." });
    }
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.status(200).json(product);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid product id." });
    }
    res.status(500).json(err);
  }
});

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      });
    } else {
      products = await Product.find();
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
