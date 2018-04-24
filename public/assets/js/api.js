jQuery(document).ready(function() {

  var newApikey = "";
  //generate API Key
  $('#APIkeycont').hide();
  $('#createAPIkey').on('click', function() {
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 16; i++) {
      newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    $('#APIkeycont').show();
    $('#APIKey').html("<p style='color:red' id='newapikey'>" + newApikey + "</p>");
  });

  // dynamically behave sidebar based on screen size
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

  // Logout
  $('#logoutbtn').on('click', function() {
    window.localStorage.removeItem("token");
    window.location = "signin.html";
  });

  // Upload data to database
  $('#okbt').on('click', function() {
    console.log($("#newapikey").text());
    $.ajax({
      url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/api/upload',
      dataType: 'json',
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify({
        name: $("#name").val(),
        apikey: $("#newapikey").text()
      }),
      success: function(data, textStatus, jQxhr) {
        $('#APIkeycont').hide();
        console.log('API Key save success');
        alert(data.message);
      },
      error: function(jqXhr, textStatus, errorThrown) {
        console.log(errorThrown, jqXhr, textStatus);
        console.log(jqXhr.responseJSON);
        alert(jqXhr.responseJSON.message + ", API key save fail!");
      }
    });
  });

});
