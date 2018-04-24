var db = require("../db");

var SunscreenSchema = new db.Schema({
  email: {
    type: String,
    required: true
  },
  sunscreenType: {
    type: String,
    required: true
  },
  sunscreenTime: {
    type: Date,
    default: Date.now
  }
});

var Sunscreen = db.model("Sunscreen", SunscreenSchema);

module.exports = Sunscreen;
