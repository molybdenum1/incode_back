const { Schema, model } = require("mongoose");

//user's data model
const User = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: [{ type: String, ref: "Role" }],
  subordinates: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

module.exports = model("User", User);
