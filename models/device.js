var db = require("../db");

var deviceSchema = new db.Schema({
  apikey: String,
  deviceId: {
    type: String,
    unique: true
  },
  userEmail: String,
  lastContact: {
    type: Date,
    default: Date.now
  }
});

var Device = db.model("Device", deviceSchema);

module.exports = Device;
