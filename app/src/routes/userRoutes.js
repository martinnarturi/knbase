const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const passport = require('passport');
const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config/jwt.js');
const maxAge = 24 * 3600;

router.post('/create', async(req, res) => {
  let { name, pass } = req.body;

  if(!name || !pass || name == '' || pass == '') {
    return res.status(400).json('Please send a name and pass to create a new user');
  }

  let userExists = await User.find({ name }).exec();
  if(userExists.length > 0) {
    return res.status(409).json('User name already exists, please pick another one');
  }

  bcrypt.hash(pass, saltRounds, async function(err, hashedPass) {
    const user = new User({name, pass: hashedPass, lastLogin: new Date(), isDeleted:false });
    await user.save({validateBeforeSave: false });
    
    const token = jwt.sign(
      { id: user._id, name: user.name },
      jwtSecret,
      { expiresIn: maxAge, }
    );
  
    res.status(201)
      .cookie("jwt", token, {
        httpOnly: true,
        maxAge: maxAge * 1000,
      })
      .json({
        message: 'new user created',
        user: {
          name,
          pass,
        }
      });
  });
});

router.post('/login',
  passport.authenticate('local', { session: false }),
  function(req, res) {
    const token = jwt.sign(
      { user: {
        id: req.user._id, 
        name: req.user.name
      }},
      jwtSecret,
      { expiresIn: maxAge, }
    );
    res.status(200)
      .cookie("jwtUser", token, {
        httpOnly: true,
        maxAge: maxAge * 1000,
      })
      .json({
        message: 'logged in',
        user: { name: req.user.name } 
      });
  }
);

router.post('/logout',
  (req, res) => {
    res.status(200)
      .clearCookie("jwtUser")
      .json('logged out');
  }
);

router.get('/info',
  (req, res) => {
    if(!req.cookies.jwtUser) {
      return res.status(200).json({})
    }
    const token = req.cookies.jwtUser
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(500).json({ message: "An error occurred" })
      } else {
        if (decodedToken.user) {
          return res.status(200).json({ user: decodedToken.user });
        } else {
          return res.status(200).json({});
        }
      }
    })
  }
);

module.exports = router;