const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Define the user schema
const postSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  title: String,
  description: String,
  image: String,
});

module.exports = mongoose.model("post", postSchema);
