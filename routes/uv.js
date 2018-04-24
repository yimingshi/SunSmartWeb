var express = require('express');
var router = express.Router();
var jwt = require("jwt-simple");
var request = require("request");

var UvData = require('../models/uv');
var Device = require('../models/device');
var User = require('../models/user');
var Sunscreen = require('../models/sunscreen');

var secret = 'supersecret';

router.post('/upload', function(req, res, next) {
  var responseJson = {
    uploaded: false,
    message: "",
  };
  // validate API
  Device.findOne({
    deviceId: req.body.deviceid
  }, function(err, device) {
    if (err) {
      console.log("Error: " + err);
      responseJson.message = err;
      res.status(400).send(JSON.stringify(responseJson));
    } else if (device == null) {
      responseJson.message = "Device: " + req.body.deviceid + " is not registered.";
      console.log(responseJson.message);
      res.status(400).send(JSON.stringify(responseJson));
    } else if (!req.body.hasOwnProperty("apikey") || device.apikey !== req.body.apikey) {
      responseJson.message = "Device: " + req.body.deviceid + " wrong API key.";
      console.log(responseJson.message);
      res.status(400).send(JSON.stringify(responseJson));
    } else {
      console.log(req.body);
      var newuvdata = new UvData({
        deviceid: req.body.deviceid,
        uvindex: req.body.uvindex,
        time: req.body.time,
        loc: req.body.loc
      });
      // Save newuvdata. If successful, return success. If not, return error message.
      newuvdata.save(function(err, newuvdata) {
        if (err) {
          console.log("Error: " + err);
          responseJson.message = err;
          res.status(400).send(JSON.stringify(responseJson));
        } else {
          responseJson.uploaded = true;
          responseJson.message = "Data from" + req.body.deviceid + " was uploaded. Time: " + req.body.time + ".";
          res.status(201).send(JSON.stringify(responseJson));
        }
      });
    }
  });
});

// download uv data
router.get('/download', function(req, res, next) {

  var responseJson = {
    downloaded: false,
    message: "",
  };

  if (!req.headers["x-auth"]) {
    return res.status(401).json({
      error: "Missing X-Auth header"
    });
  }

  userauth(req.headers["x-auth"]).then(function() {
    // find data
    UvData.find({
      deviceid: req.query.deviceid
    }, function(err, uvdata) {
      if (err || uvdata == null) {
        responseJson.message = err;
        res.status(401).send(JSON.stringify(responseJson));
      } else {
        responseJson.message = uvdata;
        responseJson.downloaded = true;
        res.status(201).send(JSON.stringify(responseJson));
      }
    })
  }, function(err) {
    console.log(err);
    res.status(401).json({
      error: "invalid token"
    })
  })

});

// request weather forecast
router.post('/weather', function(req, res, next) {

  console.log(req.body);

  var responseJson = {
    date1: "Invalid",
    date2: "Invalid",
    date3: "Invalid",
    date4: "Invalid",
    date5: "Invalid",
    uv1: "Invalid",
    uv2: "Invalid",
    uv3: "Invalid",
    uv4: "Invalid",
    uv5: "Invalid",
    temp1: "Invalid",
    temp2: "Invalid",
    temp3: "Invalid",
    temp4: "Invalid",
    temp5: "Invalid",
    status: "ERROR"
  };

  var apikey = "49df90fdb9fe4f318bc215c6ce26fdbc";

  if (req.body.hasOwnProperty("lat") && req.body.hasOwnProperty("lon")) {
    var lat = req.body.lat;
    var lon = req.body.lon;
  } else {
    responseJson = {
      error: "lat or lon or city parameters missing"
    };
    return res.status(400).send(JSON.stringify(responseJson));
  }

  if (!req.headers["x-auth"]) {
    return res.status(401).json({
      error: "Missing X-Auth header"
    });
  }

  userauth(req.headers["x-auth"]).then(function() {
    request({
      method: "GET",
      uri: "https://api.weatherbit.io/v2.0/forecast/daily",
      qs: {
        lat: lat,
        lon: lon,
        key: apikey
      }
    }, function(error, response, body) {
      if (error) {
        console.log(error);
      }
      var reqsult = JSON.parse(body);
      responseJson.status = "OK"
      responseJson.date1 = reqsult.data[0].datetime;
      responseJson.date2 = reqsult.data[1].datetime;
      responseJson.date3 = reqsult.data[2].datetime;
      responseJson.date4 = reqsult.data[3].datetime;
      responseJson.date5 = reqsult.data[4].datetime;
      responseJson.uv1 = reqsult.data[0].uv;
      responseJson.uv2 = reqsult.data[1].uv;
      responseJson.uv3 = reqsult.data[2].uv;
      responseJson.uv4 = reqsult.data[3].uv;
      responseJson.uv5 = reqsult.data[4].uv;
      responseJson.temp1 = reqsult.data[0].temp;
      responseJson.temp2 = reqsult.data[1].temp;
      responseJson.temp3 = reqsult.data[2].temp;
      responseJson.temp4 = reqsult.data[3].temp;
      responseJson.temp5 = reqsult.data[4].temp;
      res.status(200).send(JSON.stringify(responseJson));
    })

  }, function(err) {
    console.log("rejected");
    res.status(401).json({
      error: "invalid token"
    })
  })

});


// sunscreen upload
router.post("/sunscreen", function(req, res, next) {
  var newSunscreen = new Sunscreen({
    email: req.body.email,
    sunscreenTime: req.body.time,
    sunscreenType: req.body.type
  });

  newSunscreen.save(function(err) {
    if (err) {
      res.status(400).json({
        success: false,
        message: "DB save error"
      });
    } else {
      res.status(201).json({
        success: true,
        message: newSunscreen.email + "'s sunscreen saved!"
      });
    }
  });
});

// UV around your
router.get('/cityuv', function(req, res, next) {
  var responseJson = {
    uv: "Invalid",
    status: "ERROR"
  };
  var apikey = "49df90fdb9fe4f318bc215c6ce26fdbc";
  //get zipcode

  if (req.query.hasOwnProperty("city")) {
    var city = req.query.city;
  } else if (req.query.hasOwnProperty("postal_code")) {
    var postal_code = req.query.postal_code;
  } else {
    responseJson = {
      error: "city parameters missing"
    };
    res.status(400).send(JSON.stringify(responseJson));
    return;
  }

  request({
    method: "GET",
    uri: "https://api.weatherbit.io/v2.0/current",
    qs: {
      postal_code: postal_code,
      city: city,
      key: apikey
    }
  }, function(error, response, body) {
    var reqsult = JSON.parse(body);
    responseJson.status = "OK"

    responseJson.uv = reqsult.data[0].uv;
    res.status(200).send(JSON.stringify(responseJson));
  })
});

function userauth(token) {
  return new Promise(function(resolve, reject) {
    var decoded = jwt.decode(token, secret);
    User.findOne({
      email: decoded.email
    }, function(err, user) {
      if (err) {
        reject(err);
      } else if (user == null || user.token !== token) {
        reject(user);
      } else {
        resolve();
      }
    });
  })
}

module.exports = router;
