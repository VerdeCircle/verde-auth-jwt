const jwt = require('jsonwebtoken');
const User = require('../models/login');

const AUTH_FAILED = { error: process.env.MSG_UNAUTHORIZED };

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').slice("Bearer ".length); // significantly faster than .replace
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

    if (!user) return req.status(401).send(AUTH_FAILED);

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send(AUTH_FAILED);
  }
};

module.exports = auth;