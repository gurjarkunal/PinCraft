const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb+srv://sharmakaratika57:kunal2425@pincraft.izgfmkp.mongodb.net/pin")
// mongoose.connect("mongodb://127.0.0.1:27017/pin");

// Define the user schema
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: String,
  board:{
    type: Array,
    default: []
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post"
    }
  ],
  favourites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

userSchema.plugin(plm)
// Create the user model
module.exports = mongoose.model("user", userSchema);









// const mongoose = require('mongoose')
// const plm = require('passport-local-mongoose')

// mongoose.connect = ("mongodb://127.0.0.1:27017/pin")

// const userSchema = mongoose.Schema({
//   username: String,
//   fullname: String,
//   email: String,
//   password: String,
//   profileImage: String,
//   board:{
//     type: Array,
//     default: []
//   }
// })

// userSchema.plugin(plm);

// module.exports = mongoose.model('user', userSchema)