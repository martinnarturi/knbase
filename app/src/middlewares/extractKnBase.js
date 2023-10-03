const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config/jwt.js');

function extractKnBase(req, res, next) {
  if(req.cookies.jwtKb) {
    const token = req.cookies.jwtKb
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (!err && decodedToken.knBase) {
        req.knBase = decodedToken.knBase
      }
    })
  }
  next();
}

module.exports = {
  extractKnBase
}