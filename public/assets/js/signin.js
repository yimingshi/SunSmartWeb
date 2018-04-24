jQuery(document).ready(function() {

  // Fullscreen background
  $.backstretch("assets/img/background_california2.jpg");

  // Enable tooltip
  $('[data-toggle="tooltip"]').tooltip();

  //Login ajax
  $('.login-form input[type="text"], .login-form input[type="password"], .login-form input[type="email"]').on('focus', function() {
    $(this).removeClass('input-error');
  });

  $('.login-form').on('submit', function(e) {
    e.preventDefault();

    var valiflag = true;

    $(this).find('input[type="text"], input[type="password"], input[type="email"]').each(function() {
      if ($(this).val() == "") {
        $(this).addClass('input-error');
        $('.loginwarning').text('* Missing information.');
        valiflag = false;
      } else {
        $(this).removeClass('input-error');
        $('.loginwarning').text('');
      }
    });

    if (valiflag == true) {
      $.ajax({
        url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/users/login',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
          email: $("#login-email").val(),
          password: $("#login-password").val()
        }),
        success: function(data, textStatus, jQxhr) {
          if (data.token) {
            window.localStorage.setItem("token", data.token);
            window.location = data.redirect;
          }
        },
        error: function(jqXhr, textStatus, errorThrown) {
          $('.loginwarning').text('* Wrong email or password.');
        }
      });
    }
  });

  //Registration ajax
  $('.registration-form input[type="text"], .registration-form input[type="password"], .registration-form input[type="email"]').on('focus', function() {
    $(this).removeClass('input-error');
  });

  $('.registration-form').on('submit', function(e) {
    e.preventDefault();

    if (regiValidation($(this))) {
      $(this).find('input[type="text"],input[type="password"], input[type="email"]').removeClass('input-error');
      $('.regiwarning').text('');
      $.ajax({
        url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/users/register',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
          email: $("#regi-email").val(),
          password: $("#regi-password").val(),
          deviceid: $("#regi-deviceid").val()
        }),
        success: function(data, textStatus, jQxhr) {
          $('.loginnoti').text('* Register successful! Please login with your account.');
        },
        error: function(jqXhr, textStatus, errorThrown) {
          console.log(errorThrown);
          $('.regiwarning').text('* Invalid email or device.');
        }
      });
    }
  });

  // Register form validation
  function regiValidation(element) {

    var flag = true;
    element.find('input[type="text"],input[type="password"], input[type="email"]').each(function() {
      if ($(this).val() == "") {
        $(this).addClass('input-error');
        $('.regiwarning').text('* Missing information.');
        flag = false;
      }
    })
    if (!flag) {
      return false;
    }

    if (!checkEmail($('#regi-email').val())) {
      $('#regi-email').addClass('input-error');
      $('.regiwarning').html('* Invalid email address.');
      return false;
    }

    if (!checkPassword($('#regi-password').val())) {
      $('#regi-password').addClass('input-error');
      $('.regiwarning').html("* Please use strong password. <i class='fa fa-question-circle' style='cursor: pointer' aria-hidden='true' data-toggle='tooltip' data-delay='{'show':'500'}' data-placement='bottom' title='A strong password should contain at least 8 character with uppercase, lowercase and digit.'></i>");
      return false;
    }
    if ($('#regi-password').val() != $('#regi-password-confirm').val()) {
      e.preventDefault();
      $('#regi-password').addClass('input-error');
      $('#regi-password-confirm').addClass('input-error');
      $('.regiwarning').text('* Unmatched Password.');
      return false;
    }
    return true;
  }

  // Check strong Password
  function checkPassword(str) {
    var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(str);
  }

  // Check Email
  function checkEmail(str) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(str);
  }
});
