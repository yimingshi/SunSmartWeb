jQuery(document).ready(function() {
  // Logout
  $('#logoutbtn').on('click', function() {
    window.localStorage.removeItem("token");
    window.location = "signin.html";
  });

  // Token Based Authentication
  var token = window.localStorage.getItem("token");
  var email = "";

  function userAuth(callback) {
    $.ajax({
      url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/users/auth',
      type: 'get',
      headers: {
        "X-Auth": token
      },
      success: function(data, textStatus, jQxhr) {
        email = data.email;
        $('#showemail').text(email);
        callback(data.email)
      },
      error: function(jqXhr, textStatus, errorThrown) {
        var jsonResponse = JSON.parse(jqXhr.responseText);
        window.localStorage.removeItem("token");
        window.location = jsonResponse.redirect;
      }
    });
  }

  // Require User Information
  function requireUser(email) {
    var dataString = "email=" + email;
    $.ajax({
      url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/users/status',
      dataType: 'json',
      type: 'get',
      headers: {
        "X-Auth": token
      },
      data: dataString,
      success: function(data, textStatus, jQxhr) {
        console.log(data);
        if (data.hasOwnProperty("firstName") && data.hasOwnProperty("lastName")) {
          $('#showname').text(data.firstName + ' ' + data.lastName);
        } else {
          $('#showname').text("Anonym");
        }
        if (data.hasOwnProperty("intro")) {
          $('#showintro').text(data.intro);
        }
      },
      error: function(jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    });
  }

  // Use callback
  userAuth(requireUser);

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
      $('#sidebarCollapse').off('click');
      $('#dismiss, .overlay').off('click');
      $('#sidebarCollapse').hide();

      $('#sidebarCollapse').on('click', function() {
        // toggle sidebar
        $('#sidebar').addClass('active');
        $('#sidebarCollapse').fadeOut();
        $('#content').removeClass('active');
      });

      $('#dismiss, .overlay').on('click', function() {
        // toggle sidebar
        $('#sidebar').removeClass('active');
        $('#content').addClass('active');
        $('#sidebarCollapse').fadeIn();
        // close dropdowns
        $('.collapse').collapse('hide');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
      });
    }
  }

  // modify password
  $('#passbtn-e').on('click', function(e) {
    e.preventDefault();
    if (!$('#passwordold-e').val() || !$('#passwordnew-e').val()) {
      return alert("Missing password information!");
    }
    $.ajax({
      url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/users/password',
      dataType: 'json',
      type: 'post',
      headers: {
        "X-Auth": token
      },
      contentType: 'application/json',
      data: JSON.stringify({
        email: email,
        oldpassword: $('#passwordold-e').val(),
        newpassword: $('#passwordnew-e').val()
      }),
      success: function(data, textStatus, jQxhr) {
        alert("Your password has been changed successfully!");
        window.location = "customer.html";
      },
      error: function(jqXhr, textStatus, errorThrown) {
        alert("Sorry, password change failed.");
      }
    })
  });

  // modify Profile
  $('#button-e').on('click', function(e) {
    e.preventDefault();
    if (!$('#zipcode-e').val() || !$('#firstname-e').val() || !$('#lastname-e').val() && !$('#address-e').val() || !$('#city-e').val() || !$('#state-e').val()) {
      return alert("Missing profile information!");
    }
    $.ajax({
      url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/users/profile',
      dataType: 'json',
      type: 'post',
      headers: {
        "X-Auth": token
      },
      contentType: 'application/json',
      data: JSON.stringify({
        email: email,
        zip: $('#zipcode-e').val(),
        firstname: $('#firstname-e').val(),
        lastname: $('#lastname-e').val(),
        address: $('#address-e').val(),
        city: $('#city-e').val(),
        state: $('#state-e').val(),
        intro: $('#aboutme-e').val()
      }),
      success: function(data, textStatus, jQxhr) {
        alert("Your profile has been changed successfully!");
        window.location = "customer.html";
      },
      error: function(jqXhr, textStatus, errorThrown) {
        alert("Sorry, profile change failed.");
      }
    })
  });

});
