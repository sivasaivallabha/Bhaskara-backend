const jwt = require('jsonwebtoken');

function verifyAdmin(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) return res.status(401).json({ message: "No token ❌" });

  try {
    const decoded = jwt.verify(token, "secretkey");

    if (decoded.role !== 'admin' && decoded.role !== 'staff') {
      return res.status(403).json({ message: "Not admin or staff ❌" });
    }

    next();

  } catch (err) {
    res.status(401).json({ message: "Invalid token ❌" });
  }
}

module.exports = verifyAdmin;