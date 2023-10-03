const express = require('express');
const router = express.Router();
const KnBase = require('../models/knBase');
const generator = require('generate-password');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config/jwt.js');
const maxAge = 24 * 3600;
const passport = require('passport');

router.post('/create', passport.authenticate('user-jwt-auth', { session:false }), async(req, res) => {
  let { name } = req.body;

  if(!(name)) {
    return res.status(400).json('Please send a name to add a kn base');
  }

  let password = generator.generate({
    length: 16,
    numbers: true
  })

  let masterpassword = generator.generate({
    length: 16,
    numbers: true
  })

  let code
  let knBaseExists

  while(true) {
    code = name + "-" + generator.generate({
      length: 10,
      numbers: true
    })

    knBaseExists = await KnBase.find({ code }).exec();

    if(knBaseExists.length == 0) {
      break
    }
  }

  bcrypt.hash(masterpassword, saltRounds, function(err, masterhash) {
    bcrypt.hash(password, saltRounds, async function(err, hash) {
      const knBase = new KnBase({
        name,
        code,
        pass: hash,
        masterpass: masterhash,
        isDeleted:false,
        createdBy: req.user._id
      });
      await knBase.save({validateBeforeSave: false });

      res.status(201).json({
        message: 'kn base created',
        knBase: {
          name,
          code,
          pass: password,
          masterpass: masterpassword,
        }
      });
    });
  });

});

router.post('/connect', passport.authenticate('user-jwt-auth', { session:false }), async(req, res) => {
  let { code, pass } = req.body;

  if(!code || !pass) {
    return res.status(400).json('Please send code and pass to connect to a kb');
  }

  let knBase = await KnBase.findOne({ code }).exec();

  if(!knBase || knBase.length == 0) {
    return res.status(200).json('Could not connect to kb, please check your data and try again');
  }

  return bcrypt.compare(pass, knBase.pass).then(function (result) {
    if(!result) {
      return res.status(200).json('Could not connect to kb, please check your data and try again');
    }

    const token = jwt.sign(
      { knBase: { name: knBase.name, code: knBase.code }},
      jwtSecret,
      { expiresIn: maxAge, }
    );

    return res.status(200)
      .cookie("jwtKb", token, {
        httpOnly: true,
        maxAge: maxAge * 1000,
      })
      .json({
        message: 'connected to ' + knBase.name,
        knBase: { name: knBase.name }
      });
  })
});

router.post('/disconnect', (req, res) => {
  res.status(200)
    .clearCookie("jwtKb")
    .json('disconnected');
});

router.get('/info', (req, res) => {
  if(!req.cookies.jwtKb) {
    return res.status(200).json({})
  }
  const token = req.cookies.jwtKb
  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    if (err) {
      return res.status(500).json({ message: "An error occurred" })
    } else {
      if (decodedToken.knBase) {
        return res.status(200).json({ knBase: decodedToken.knBase });
      } else {
        return res.status(200).json({});
      }
    }
  })
});

module.exports = router;