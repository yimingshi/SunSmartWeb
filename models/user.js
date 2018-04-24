var db = require("../db");

var userSchema = new db.Schema({
  email: {
    type: String,
    required: true
  },
  deviceid: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  token: {
    type: String
  },
  fullName: {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    }
  },
  fullAddress: {
    address: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    zip: {
      type: String
    }
  },
  intro: {
    type: String
  },
  active: {
    type: Boolean,
    default: false
  },
  activeToken: String,
  activeExpires: Date
});

var User = db.model("User", userSchema);

module.exports = User;
