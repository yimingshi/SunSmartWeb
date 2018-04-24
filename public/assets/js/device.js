jQuery(document).ready(function() {

  // Token Based Authentication
  var token = window.localStorage.getItem("token");
  var email = "";

  // Logout
  $('#logoutbtn').on('click', function() {
    window.localStorage.removeItem("token");
    window.location = "signin.html";
  });

  function userAuth(callback) {
    $.ajax({
      url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/users/auth',
      type: 'get',
      headers: {
        "X-Auth": token
      },
      success: function(data, textStatus, jQxhr) {
        email = data.email;
        callback(data.email)
      },
      error: function(jqXhr, textStatus, errorThrown) {
        var jsonResponse = JSON.parse(jqXhr.responseText);
        console.log(jsonResponse);
        window.localStorage.removeItem("token");
        window.location = jsonResponse.redirect;
      }
    });
  }

  // Require Device Information
  function requireDevice(email) {
    var dataString = "email=" + email;
    var devicelist = "";
    $.ajax({
      url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/device/status',
      dataType: 'json',
      type: 'get',
      headers: {
        "X-Auth": token
      },
      data: dataString,
      success: function(data, textStatus, jQxhr) {
        $.each(data, function(index, value) {
          if (!value.hasOwnProperty("apikey")) {
            $("#devicelist").append("<tr><td>" + value.deviceId + "</td><td><button class='btn btn-sm btn-danger apibtn' type='button' name='button'>Apply API Key</button></td><td>" + value.lastContact + "</td></tr>");
          } else {
            $("#devicelist").append("<tr><td>" + value.deviceId + "</td><td>" + value.apikey + "</td><td>" + value.lastContact + "</td></tr>");
          }
        });
        $.each($(".apibtn"), function() {
          $(this).on('click', function() {
            requireAPIkey($(this).parent().siblings().eq(0).text(), $(this).parent());
          });
        })
      },
      error: function(jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  }

  // Dynamic Sidebar Behavior
  if (matchMedia) {
    const mq = window.matchMedia("(max-width: 768px)");
    mq.addListener(WidthChange);
    WidthChange(mq);
  }

  function WidthChange(mq) {
    if (mq.matches) {
      // window width is less than 768px
      $('#sidebarCollapse').show();
      $('.table').addClass("table-responsive");
      $('#sidebarCollapse').off('click');
      $('#dismiss, .overlay').off('click');
      $('#sidebarCollapse').on('click', function() {
        // toggle sidebar
        $('#sidebar').removeClass('active');
        //fadein overlay
        $('.overlay').fadeIn('slow');
      });
      $('#dismiss, .overlay').on('click', function() {
        // toggle sidebar
        $('#sidebar').addClass('active');
        // close dropdowns
        $('.collapse').collapse('hide');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
        // fade out the overlay
        $('.overlay').fadeOut('slow');
      });
    } else {
      // window width is larger than 768px
      $('.table').removeClass("table-responsive");
      $('#sidebarCollapse').off('click');
      $('#dismiss, .overlay').off('click');
      $('#sidebarCollapse').hide();

      $('#sidebarCollapse').on('click', function() {
        // toggle sidebar
        $('#sidebar').addClass('active');
        $('#sidebarCollapse').hide();
        $('#content').removeClass('active');
      });

      $('#dismiss, .overlay').on('click', function() {
        // toggle sidebar
        $('#sidebar').removeClass('active');
        $('#content').addClass('active');
        $('#sidebarCollapse').show();
        // close dropdowns
        $('.collapse').collapse('hide');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
      });
    }
  }

  // Use callback
  userAuth(requireDevice);

  // Dynamic Behavior for Register block
  $('#regihead').on('mouseover', function() {
    $('#regiblock').slideDown('fast');
  });
  $('#regiblock').on('mouseleave', function() {
    $('#regiblock').slideUp('fast');
  });
  $('#registerDevice').on('click', function() {

    registerNewDevice().fail(function() {
      $("#feedback1").text("This device can't be registered.");
    }).done(function(data) {
      $("#devicelist").append("<tr><td>" + $('#newdevice').val() + "</td><td><button class='btn btn-sm btn-danger apibtn' type='button' name='button'>Apply API Key</button></td><td>" + data.lastContact + "</td></tr>");
      $(".apibtn:last").on('click', function() {
        requireAPIkey($(this).parent().siblings().eq(0).text(), $(this).parent());
      });
      $('#newdevice').val('');
      $("#feedback1").text("");
    });

  });
  $('#regicancel').on('click', function() {
    $('#regiblock').slideUp('fast');
    $('#newdevice').val('');
    $("#feedback1").text("");
  });

  // Dynamic Behavior for Delete block
  $('#delehead').on('mouseover', function() {
    $('#deleblock').slideDown('fast');
  });
  $('#deleblock').on('mouseleave', function() {
    $('#deleblock').slideUp('fast');
  });
  $('#cancelDevice').on('click', function() {
    deleteOldDevice().fail(function() {
      $("#feedback2").text("Can't delete this device.");
    }).done(function() {
      window.location = "device.html";
    });
  });
  $('#delecancel').on('click', function() {
    $('#olddevice').val('');
    $('#deleblock').slideUp('fast');
    $("#feedback2").text("");
  });

  // Add device
  function registerNewDevice() {
    var dfd = $.Deferred();
    if ($('#newdevice').val()) {
      var dataString = "deviceid=" + $('#newdevice').val() + "&email=" + email;
      $.ajax({
        url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/device/adddevice',
        dataType: 'json',
        type: 'get',
        headers: {
          "X-Auth": token
        },
        data: dataString,
        success: function(data, textStatus, jQxhr) {
          console.log('Register new device successfully');
          dfd.resolve(data);
        },
        error: function(jqXhr, textStatus, errorThrown) {
          console.log(errorThrown);
          dfd.reject();
        }
      });
    } else {
      dfd.reject();
    }
    return dfd.promise();
  }

  // Delete device
  function deleteOldDevice() {
    var dfd = $.Deferred();
    if ($('#olddevice').val()) {
      var dataString = "deviceid=" + $('#olddevice').val() + "&email=" + email;
      $.ajax({
        url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/device/removedevice',
        dataType: 'json',
        type: 'get',
        headers: {
          "X-Auth": token
        },
        data: dataString,
        success: function(data, textStatus, jQxhr) {
          console.log('Remove device successfully');
          dfd.resolve();
        },
        error: function(jqXhr, textStatus, errorThrown) {
          console.log(jqXhr);
          dfd.reject();
        }
      });
    } else {
      dfd.reject();
    }
    return dfd.promise();
  }

  // Require API key
  function requireAPIkey(deviceid, element) {
    var dataString = "deviceid=" + deviceid + "&email=" + email;
    $.ajax({
      url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/device/apireq',
      dataType: 'json',
      type: 'get',
      headers: {
        "X-Auth": token
      },
      data: dataString,
      success: function(data, textStatus, jQxhr) {
        element.text(data.apikey)
      },
      error: function(jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
        element.append('<p>Please Try Later</p>');
      }
    });
  }

});
