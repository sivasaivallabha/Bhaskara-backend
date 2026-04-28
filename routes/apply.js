const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    await sendEmail(data);

    res.json({ message: "Email sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;