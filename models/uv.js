var db = require("../db");

var uvSchema = new db.Schema({
  deviceid: {
    type: String,
    required: true
  },
  uvindex: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  },
  loc: {
    type: String
  }
});

var UvData = db.model("UvData", uvSchema);

module.exports = UvData;
