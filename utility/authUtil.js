const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/usersModel');

const authorizeUser = (req, res, next) => {
  authorization = req.headers.authorization
  let decoded;
  try {
    decoded = jwt.verify(authorization, config.jwtSecret)
    res.userid = decoded.id;
  } catch(e) {
    return res.json({status: "fail", message: "Authentication Error"});
  }
  next();
}

const checkRoleUser = async ( req, res, next ) => {
  authorization = req.headers.authorization
  let decoded;
  try {
    decoded = jwt.verify(authorization, config.jwtSecret)
    res.signedUser = await User.findById(decoded.id);
  } catch(e) {
    return res.json({status: "fail", message: "Authentication Error"});
  }
  next();
}

module.exports = {
    authorizeUser,
    checkRoleUser
}