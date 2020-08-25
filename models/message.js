const mongoose = require("mongoose");

// Schema
const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    room: {
      type: String, //mongoose.Schema.Types.ObjectId,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middlewere
// ----------
// ----------

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
