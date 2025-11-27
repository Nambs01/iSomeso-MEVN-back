const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const messageSchema = mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
      required: true,
    },
    show: {
      type: Boolean,
      default: false,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Filtrer les reponses
messageSchema.methods.toJSON = function () {
  const message = this;

  const messageObject = message.toObject();
  messageObject.id = messageObject._id;

  delete messageObject._id;
  delete messageObject.__v;
  if (this.populated("to")) {
    const {
      _id: id,
      name,
      email,
      avatar,
      createdAt,
      updatedAt,
    } = messageObject.to;
    messageObject.to = { id, name, email, avatar, createdAt, updatedAt };
  }
  if (this.populated("from")) {
    const {
      _id: id,
      name,
      email,
      avatar,
      createdAt,
      updatedAt,
    } = messageObject.from;
    messageObject.from = { id, name, email, avatar, createdAt, updatedAt };
  }

  return messageObject;
};

messageSchema.plugin(mongoosePaginate);

const Message = mongoose.model("message", messageSchema);

module.exports = Message;
