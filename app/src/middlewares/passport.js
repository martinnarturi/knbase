const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const KnBase = require('../models/knBase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config/jwt.js');

passport.use(new LocalStrategy({
    usernameField: 'name',
    passwordField: 'pass'
  },
  async function(username, password, done) {
    let user
    try {
      user = await User.findOne({ name: username })
    } catch(err) {
      return done(err);
    }
    if (!user || user.length == 0) { return done(null, false); }
    return bcrypt.compare(password, user.pass).then(function (result) {
      return result
        ? done(null, user)
        : done(null, false)
    })
  }
));

const JwtStrategy = require('passport-jwt').Strategy;
let opts = {}
opts.jwtFromRequest = function(req) {
  if(!req.cookies.jwtUser) {
    return null
  }
  return req.cookies.jwtUser
};
opts.secretOrKey = jwtSecret;
// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';

passport.use('user-jwt-auth', new JwtStrategy(opts, async function(jwt_payload, done) {
  if(!jwt_payload) {
    return done(null, false);
  }

  try {
    let user = await User.findOne({_id: jwt_payload.user.id})
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch(err) {
    return done(err, false);
  }
}));