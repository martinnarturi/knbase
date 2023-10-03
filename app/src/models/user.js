const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    pass: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: false
  },
);

module.exports = mongoose.model('User', userSchema);