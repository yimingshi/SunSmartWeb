var express = require('express');
var router = express.Router();
var jwt = require("jwt-simple");

var UvData = require('../models/uv');
var Device = require('../models/device');
var User = require('../models/user');

var secret = 'supersecret';

// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
  var newApikey = "";
  var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 16; i++) {
    newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return newApikey;
}

function userauth(token) {
  return new Promise(function(resolve, reject) {
    var decoded = jwt.decode(token, secret);
    User.findOne({
      email: decoded.email
    }, function(err, user) {
      if (err) {
        reject(err);
      } else if (user == null || user.token !== token) {
        reject();
      } else {
        resolve();
      }
    });
  })
}

// Get status
router.get('/status', function(req, res, next) {

  var email = req.query.email;

  if (!req.headers["x-auth"]) {
    return res.status(401).json({
      error: "Missing X-Auth header"
    });
  }

  userauth(req.headers["x-auth"]).then(function() {
    Device.find({
      userEmail: email
    }, function(err, device) {
      if (err) {
        res.status(401).json({
          error: err
        });
      } else {
        res.status(200).json(device);
      }
    });
  }, function(err) {
    res.status(401).json({
      error: "invalid token"
    });
  })
});

//  Add device
router.get('/adddevice', function(req, res, next) {
  var deviceId = req.query.deviceid;
  var email = req.query.email;

  if (!req.headers["x-auth"]) {
    return res.status(401).json({
      error: "Missing X-Auth header"
    });
  }

  userauth(req.headers["x-auth"]).then(function() {
    Device.find({
      deviceId: deviceId
    }, function(err, device) {
      if (err) {
        res.status(401).json({
          error: err
        });
      } else {
        if (device.length == 0) {
          var newdevice = new Device({
            deviceId: deviceId,
            userEmail: email
          });
          newdevice.save(function(err, newdevice) {
            if (err) {
              res.status(401).json({
                error: err
              });
            } else {
              res.status(201).json(newdevice);
            }
          });
        } else {
          res.status(401).json({
            error: "deviceid already exist"
          });
        }
      }
    });
  }, function(err) {
    res.status(401).json({
      error: "invalid token"
    });
  })
});

//  Remove device
router.get('/removedevice', function(req, res, next) {
  var deviceId = req.query.deviceid;
  var email = req.query.email;

  if (!req.headers["x-auth"]) {
    return res.status(401).json({
      error: "Missing X-Auth header"
    });
  }

  userauth(req.headers["x-auth"]).then(function() {
    Device.findOneAndRemove({
      deviceId: deviceId,
      userEmail: email
    }, function(err, device) {
      if (err || device == null) {
        res.status(401).json({
          error: err
        });
      } else {
        res.status(200).json(device);
      }
    });
  }, function(err) {
    res.status(401).json({
      error: "invalid token"
    });
  })
});

// Assign API Key
router.get('/apireq', function(req, res, next) {
  var deviceId = req.query.deviceid;
  var email = req.query.email;

  if (!req.headers["x-auth"]) {
    return res.status(401).json({
      error: "Missing X-Auth header"
    });
  }

  userauth(req.headers["x-auth"]).then(function() {
    Device.findOneAndUpdate({
      deviceId: deviceId,
      userEmail: email
    }, {
      $set: {
        apikey: getNewApikey(),
      }
    }, {
      new: true
    }, function(err, device) {
      if (err) {
        res.status(401).json({
          error: err
        });
      } else {
        res.status(200).json(device);
      }
    });
  }, function(err) {
    res.status(401).json({
      error: "invalid token"
    });
  })
});


module.exports = router;
