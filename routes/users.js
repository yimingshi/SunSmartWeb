var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var jwt = require("jwt-simple");
var bcrypt = require("bcrypt-nodejs");

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var crypto = require("crypto");

var User = require('../models/user');
var Device = require('../models/device');

var secret = 'supersecret';

// login
router.post('/login', function(req, res, next) {
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) {
      res.status(401).json({
        error: "Database error"
      });
    } else if (!user) {
      res.status(401).json({
        error: "User not exist"
      });
    } else {
      bcrypt.compare(req.body.password, user.passwordHash, function(err, valid) {
        if (err) {
          res.status(401).json({
            error: "bcrypt error"
          });
        }
        if (valid) {
          var token = jwt.encode({
            email: req.body.email
          }, secret);
          user.token = token;
          user.save(function(err, user) {
            if (err) {
              res.status(401).json({
                error: "saving token error"
              });
            } else {
              res.status(200).json({
                token: token,
                email: user.email,
                redirect: "/uv.html"
              });
            }
          });
        } else {
          res.status(401).json({
            error: "Wrong password"
          });
        }
      });
    }
  });
});

// register
router.post('/register', function(req, res, next) {

  var responseJson = {
    registered: false,
    message: "",
    redirect: ""
  };

  // Ensure the request includes both the deviceid and email parameters
  if (!req.body.hasOwnProperty("password") || !req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("deviceid")) {
    responseJson.message = "Missing request information";
    res.status(400).send(JSON.stringify(responseJson));
    console.log(req.body);
    return;
  };

  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (user !== null) {
      responseJson.message = "Email Address: " + req.body.email + " already registered.";
      res.status(400).send(JSON.stringify(responseJson));
    } else {
      bcrypt.hash(req.body.password, null, null, function(err, hash) {
        if (err) {
          console.log("Error: " + err);
          responseJson.message = err;
          res.status(400).send(JSON.stringify(responseJson));
        } else {
          var activeToken = "";
          //set active expires 24 hours
          var activeExpires = Date.now() + 24 * 3600 * 1000;
          crypto.randomBytes(20, function(err, buf) {

            //make sure acive token not duplicate
            activeToken = buf.toString('hex');

            var link = 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/users/active/' +
              activeToken;

            let transporter = nodemailer.createTransport({
              host: 'smtp.qq.com',
              secureConnection: true, // use SSL
              port: 465,
              secure: true, // secure:true for port 465, secure:false for port 587
              auth: {
                user: '806397652@qq.com',
                pass: 'wjpqxdyunaigbdjj'
              }
            });

            let mailOptions = {
              from: '"SumSmart--Frank" <806397652@qq.com>',
              to: req.body.email,
              subject: 'Wellcome to SunSmart',
              text: 'dont reply', // plain text body
              html: 'please click <a href="' + link + '">here</a > to active your account', // html body
            };


            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              console.log(`Message: ${info.messageId}`);
              console.log(`sent: ${info.response}`);
            });

            var newuser = new User({
              email: req.body.email,
              deviceid: req.body.deviceid,
              passwordHash: hash,
              activeToken: activeToken,
              activeExpires: activeExpires
            });
            // Save newuser. If successful, return success. If not, return error message.
            newuser.save(function(err, newuser) {
              if (err) {
                console.log("Error: " + err);
                responseJson.message = err;
                res.status(400).send(JSON.stringify(responseJson));
              } else {
                // save the device info
                var newdevice = new Device({
                  deviceId: req.body.deviceid,
                  userEmail: req.body.email,
                });
                newdevice.save(function(err, newdevice) {
                  if (err) {
                    console.log("Error: " + err);
                    responseJson.message = err;
                    res.status(400).send(JSON.stringify(responseJson));
                  } else {
                    responseJson.registered = true;
                    responseJson.message = "Email " + req.body.email + " was registered.";
                    responseJson.redirect = "/signin.html";
                    res.status(201).send(JSON.stringify(responseJson));
                  }
                });
              }
            });
          });
        }
      });
    }
  });
});


// Token Based Authentication
router.get('/auth', function(req, res, next) {

  var responseJson = {
    message: "",
    redirect: "",
    email: ""
  };

  if (!req.headers["x-auth"] || req.headers["x-auth"] === "null") {
    responseJson.message = "Missing X-Auth header";
    responseJson.redirect = "/signin.html";
    return res.status(401).send(JSON.stringify(responseJson));
  }
  // X-Auth should contain the token
  var token = req.headers["x-auth"];
  try {
    var decoded = jwt.decode(token, secret);
    User.findOne({
      email: decoded.email
    }, function(err, user) {
      if (err) {
        responseJson.message = err;
        responseJson.redirect = "/signin.html";
        res.status(401).send(JSON.stringify(responseJson));
      } else if (user == null) {
        responseJson.message = "user doesn't exist";
        responseJson.redirect = "/signin.html";
        res.status(401).send(JSON.stringify(responseJson));
      } else if (user.token !== token) {
        responseJson.message = "token invalid";
        responseJson.redirect = "/signin.html";
        res.status(401).send(JSON.stringify(responseJson));
      } else {
        responseJson.message = "token valid";
        responseJson.email = decoded.email;
        res.status(201).json(responseJson);
      }
    });
  } catch (ex) {
    responseJson.message = "token invalid";
    responseJson.redirect = "/signin.html";
    res.status(401).send(JSON.stringify(responseJson));
  }
});

// require User information
router.get('/status', function(req, res, next) {

  var email = req.query.email;

  if (!req.headers["x-auth"]) {
    return res.status(401).json({
      err: "Missing X-Auth header"
    });
  }

  userauth(req.headers["x-auth"]).then(function() {
    User.findOne({
      email: email
    }, function(err, user) {
      if (err) {
        res.status(401).json({
          error: err
        });
      } else {
        res.status(200).json({
          firstName: user.fullName.firstName,
          lastName: user.fullName.lastName,
          intro: user.intro
        });
      }
    });
  }, function(err) {
    res.status(401).json({
      error: "invalid token"
    });
  })
});

// Modify Password
router.post('/password', function(req, res, next) {
  var email = req.body.email;
  var oldpassword = req.body.oldpassword;
  var newpassword = req.body.newpassword;

  if (!req.headers["x-auth"]) {
    return res.status(401).json({
      err: "Missing X-Auth header"
    });
  }

  userauth(req.headers["x-auth"]).then(function() {
    User.findOne({
      email: email
    }, function(err, user) {
      if (err || !user) {
        res.status(401).json({
          error: err
        })
      } else {
        bcrypt.compare(oldpassword, user.passwordHash, function(err, valid) {
          if (err) {
            res.status(401).json({
              error: "bcrypt error"
            });
          }
          if (valid) {
            bcrypt.hash(newpassword, null, null, function(err, hash) {
              if (err) {
                res.status(401).json({
                  error: err
                })
              } else {
                User.findOneAndUpdate({
                  email: email
                }, {
                  $set: {
                    passwordHash: hash,
                  }
                }, {
                  new: true
                }, function(err, user) {
                  if (err || user) {
                    res.status(401).json({
                      error: err
                    });
                  } else {
                    res.status(200).json(user);
                  }
                })
              }
            })
          } else {
            res.status(401).json({
              error: "Wrong password"
            });
          }
        })
      }
    })
  }, function(err) {
    res.status(401).json({
      error: "invalid token"
    });
  })
});

// Modify User Profile
router.post('/profile', function(req, res, next) {

  if (!req.headers["x-auth"]) {
    return res.status(401).json({
      error: "Missing X-Auth header"
    });
  }

  userauth(req.headers["x-auth"]).then(function() {
    User.findOne({
      email: req.body.email
    }, function(err, user) {
      if (err || !user) {
        res.status(401).json({
          error: err
        });
      } else {
        user.fullName.firstName = req.body.firstname;
        user.fullName.lastName = req.body.lastname;
        user.fullAddress.zip = req.body.zip;
        user.fullAddress.city = req.body.city;
        user.fullAddress.state = req.body.state;
        user.fullAddress.address = req.body.address;
        user.intro = req.body.intro;
        console.log(user);
        user.save(function(err, newuser) {
          if (err) {
            console.log(err);
            res.status(401).json({
              error: err
            });
          } else {
            res.status(200).json(newuser);
          }
        });
      }
    })
  }, function(err) {
    res.status(401).json({
      error: "invalid token"
    });
  })
});

// active account
router.get('/active/:activeToken', function(req, res, next) {

  // find user with active token
  User.findOne({
    activeToken: req.params.activeToken,
  }, function(err, user) {
    if (err) return next(err);
    // no user with this active token
    if (!user) {
      return res.render('message', {
        title: 'active failed',
        content: 'your active link is invalid，please <a href=" ">reregister</a >'
      });
    }

    // active and save
    user.active = true;
    user.save(function(err, user) {
      if (err) return next(err);
    });
    res.status(401).json({
      message: "active success!"
    });
  });
});

// seperated auth function
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

module.exports = router;
