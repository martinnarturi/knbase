const mongoose = require('mongoose');

const url = 'mongodb://mongo:27017/kbase';

const connectDb = () => {
  mongoose.connect(url);
};

module.exports = connectDb;
