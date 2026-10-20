const router = require("express").Router();
const Product = require("../models/Product");
const { verifyToken } = require("./verifyToken");
const stripe = process.env.STRIPE_KEY
  ? require("stripe")(process.env.STRIPE_KEY)
  : null;

router.post("/payment", verifyToken, async (req, res) => {
  if (!stripe) {
    return res.status(500).json({
      message: "STRIPE_KEY is missing in the backend .env file.",
    });
  }

  const requestedAmount = Number(req.body.amount);
  const products = Array.isArray(req.body.products) ? req.body.products : [];
  if (!req.body.tokenId || !Number.isInteger(requestedAmount) || requestedAmount <= 0 || !products.length) {
    return res.status(400).json({ message: "A valid payment token, products, and amount are required." });
  }

  try {
    const productIds = products.map((product) => product.productId);
    const productDocs = await Product.find({ _id: { $in: productIds } });
    const prices = new Map(productDocs.map((product) => [String(product._id), Number(product.price)]));

    if (prices.size !== new Set(productIds).size || productIds.some((id) => !prices.has(String(id)))) {
      return res.status(400).json({ message: "One or more products are no longer available." });
    }

    const expectedAmount = Math.round(
      products.reduce(
        (total, product) =>
          total + prices.get(String(product.productId)) * Math.max(1, Number(product.quantity) || 1),
        0
      ) * 100
    );

    if (requestedAmount !== expectedAmount) {
      return res.status(400).json({ message: "The cart total is out of date. Refresh and try again." });
    }

    stripe.charges.create(
    {
      source: req.body.tokenId,
      amount: expectedAmount,
      currency: "usd",
    },
    (stripeErr, stripeRes) => {
      if (stripeErr) {
        res.status(500).json(stripeErr);
      } else {
        res.status(200).json(stripeRes);
      }
    }
    );
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "One or more products are invalid." });
    }
    res.status(500).json(error);
  }
});

module.exports = router;
