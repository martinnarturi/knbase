const mongoose = require('mongoose');
const { Schema } = mongoose;

const knPieceSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      required: true,
    },
    kbCode: {
      type: [String],
      required: true,
    }
  },
  {
    timestamps: true,
    strict: false
  },
);

module.exports = mongoose.model('KnPiece', knPieceSchema);