var express = require('express');
var router = express.Router();
var request = require('request');

var Apikey = require('../models/apikey');
var UvData = require('../models/uv');

// Add a new api key to the database
router.post("/upload", function(req, res, next) {
  console.log(req);
  // Create a hash for the submitted password
  var newApikey = new Apikey({
    name: req.body.name,
    key: req.body.apikey
  });
  newApikey.save(function(err) {
    console.log(err);
    if (err) {
      res.status(400).json({
        success: false,
        message: "DB save error"
      });
    } else {
      res.status(201).json({
        success: true,
        message: "API key for " + newApikey.name + " saved"
      });
    }
  });
});

router.get("/averageUV", function(req, res, next) {
  var responseJson = {
    message: "",
    uv: ""
  };

  var zipcode = req.query.zipcode;
  var lon = req.query.lon;
  var lat = req.query.lat;
  if (!req.query.hasOwnProperty("key")) {
    responseJson.message = "apikey required!";
    res.status(401).send(JSON.stringify(responseJson));
    return;
  }
  Apikey.findOne({
    key: req.query.key
  }, function(err, apikey) {
    if (err) {
      responseJson.message = err;
      res.status(401).send(JSON.stringify(responseJson));
      return;
    } else if (apikey == null) {
      responseJson.message = "apikey doesn't exist";
      res.status(401).send(JSON.stringify(responseJson));
      return;
    } else {
      if (req.query.hasOwnProperty("zipcode")) {
        var zipcode = req.query.zipcode;
        var apikey = "nS96ihB9c33DjBmUi7q1goU1LN74oFvXGN7d6DHA7eeXhn2QxtFgQ4vRZrbacp77";
        request({
          method: "GET",
          url: "https://www.zipcodeapi.com/rest/" + apikey + "/info.json/" + zipcode + "/degrees",
        }, function(error, response, body) {
          var result = JSON.parse(body);
          var loc = "[ " + result.lat + ", " + result.lng + " ]";
          UvData.find({
            loc: loc
          }, function(err, uvdata) {
            if (err || uvdata.length == 0) {
              res.status(401).json({
                err: "Opps, no data for this location can be founded at" + loc + "."
              });
            } else {
              res.status(201).json(uvdata);
            }
          })
        })
      } else if (req.query.hasOwnProperty("lon") && req.query.hasOwnProperty("lat")) {
        var lon = req.query.lon;
        var lat = req.query.lat;
        var loc = "[ " + lat + ", " + lon + " ]";
        UvData.find({
          loc: loc
        }, function(err, uvdata) {
          if (err || uvdata.length == 0) {
            res.status(401).json({
              err: "Opps, no data for this location can be founded at" + loc + "."
            });
          } else {
            res.status(201).json(uvdata);
          }
        })
      } else {
        responseJson = {
          error: "Missing parameters!"
        };
        res.status(400).send(JSON.stringify(responseJson));
      }
    }
  });
});

function findlonlat(zip) {
  var apikey = "nS96ihB9c33DjBmUi7q1goU1LN74oFvXGN7d6DHA7eeXhn2QxtFgQ4vRZrbacp77";
  var zip = zip;
  request({
    method: "GET",
    url: "https://www.zipcodeapi.com/rest/" + apikey + "/info.json/" + zip + "/degrees",
  }, function(error, response, body) {
    var result = JSON.parse(body);
    var feedback = "[ " + result.lat + ", " + result.lng + " ]";
    console.log(feedback);
    return feedback;
  })
}

module.exports = router;
