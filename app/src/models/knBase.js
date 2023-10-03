const mongoose = require('mongoose');
const { Schema } = mongoose;

const knBaseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    pass: {
      type: String,
      required: true,
    },
    masterpass: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
    strict: false
  },
);

module.exports = mongoose.model('KnBase', knBaseSchema);