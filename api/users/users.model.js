const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
//const { isEmail } = require("validator");

const userSchema = Schema({
  name: String,
  password: {
    type: String,
    required: [true, "Mot de passe requis"],
    minlength: 8,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    /* validate: {
      validator: isEmail,
      message: (props) => `${props.value} is not correct`,
    },*/
  },
  date: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    //enum: ["admin", "member"],
    enum: {
      values: ["admin", "member"],
      message: "{VALUE} inconnue",
    },
  },
  age: Number,
});

/*userSchema.pre('save', function() {
  if (!this.email) {
    const error = new Error('mon message')
    next(error)
  }
  next()
}) */

userSchema.pre("save", async function () {
  this.email = this.email.toLowerCase();
});

userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = model("User", userSchema);