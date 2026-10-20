const Order = require("../models/Order");
const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyToken, async (req, res) => {
  const { products, amount, address = {}, status = "pending" } = req.body;
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "Order products are required." });
  }

  const normalizedAmount = Number(amount);
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    return res.status(400).json({ message: "A valid order amount is required." });
  }

  try {
    const normalizedProducts = products.map((product) => ({
      productId: product.productId,
      quantity: Math.max(1, Number(product.quantity) || 1),
    }));
    const productDocs = await Product.find({
      _id: { $in: normalizedProducts.map((product) => product.productId) },
    });
    const prices = new Map(productDocs.map((product) => [String(product._id), Number(product.price)]));

    if (
      prices.size !== new Set(normalizedProducts.map((product) => product.productId)).size ||
      normalizedProducts.some((product) => !prices.has(String(product.productId)))
    ) {
      return res.status(400).json({ message: "One or more products are no longer available." });
    }

    const expectedAmount = normalizedProducts.reduce(
      (total, product) =>
        total + prices.get(String(product.productId)) * product.quantity,
      0
    );
    if (Math.abs(normalizedAmount - expectedAmount) > 0.01) {
      return res.status(400).json({ message: "The order total is out of date. Refresh and try again." });
    }

    const newOrder = new Order({
      userId: req.user.id,
      products: normalizedProducts,
      amount: expectedAmount,
      address,
      status,
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "One or more products are invalid." });
    }
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const allowedStatuses = [
      "pending",
      "paid",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid order status." });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: { status: req.body.status },
      },
      { new: true }
    );
    if (!updatedOrder) return res.status(404).json({ message: "Order not found." });
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: "Order not found." });
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER ORDERS
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// //GET ALL

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET MONTHLY INCOME

router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elemMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
