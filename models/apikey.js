var db = require("../db");
var ApikeySchema = new db.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  }
});

var Apikey = db.model("Apikey", ApikeySchema);

module.exports = Apikey;
