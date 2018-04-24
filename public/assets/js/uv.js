jQuery(document).ready(function() {

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


  // Download UV data
  var averageUV = 0;
  var num = 0;

  function requireUV(email) {
    var dataString = "email=" + email + "&deviceid=" + "12345";
    var uvdata = "";
    $.ajax({
      url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/uv/download',
      dataType: 'json',
      type: 'get',
      data: dataString,
      headers: {
        "X-Auth": token
      },
      success: function(data, textStatus, jQxhr) {

        $.each(data.message, function(index, value) {
          console.log("UV index is: " + value.uvindex + ";loc is: " + value.loc);
          averageUV = averageUV + parseInt(value.uvindex);
          num = num + 1;
        });
        averageUV = averageUV / num;
        // Chart
        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
          // The type of chart we want to create
          type: 'line',
          // The data for our dataset
          data: {
            labels: ["11/17", "11/18", "11/19", "11/20", "11/21", "11/22", "11/23"],
            datasets: [{
              label: "Daily average UV index",
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              borderColor: 'rgb(255, 99, 132)',
              data: [0, 0, 0, averageUV, 0, 0, 0],
              fill: true
            }],
          },
          // Configuration options go here
          options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
              display: false,
              text: 'Chart.js Line Chart'
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                fontColor: 'rgb(255, 99, 132)',
                boxWidth: 10,
                fontSize: 10,
              }
            },
            tooltips: {
              mode: 'index',
              intersect: false,
            },
            hover: {
              mode: 'nearest',
              intersect: true
            },
            scales: {
              xAxes: [{
                display: true,
                scaleLabel: {
                  display: false,
                  labelString: 'Month'
                },
                ticks: {
                  fontSize: 8
                }
              }],
              yAxes: [{
                display: true,
                scaleLabel: {
                  display: false,
                  labelString: 'Value'
                },
                ticks: {
                  maxTicksLimit: 5,
                  fontSize: 8
                }
              }]
            }
          }
        });
      },
      error: function(jqXhr, textStatus, errorThrown) {
        console.log(errorThrown);
      }
    })
  }

  // Use callback
  userAuth(requireUV);

  //Tips
  var tips = {
    1: "Wear sunscreen every day, in all weather and in every season. It should have a sun protection factor (SPF) of 30 and say broad-spectrum on the label, which means it protects against the sun's UVA and UVB rays. Put it on at least 15 minutes before going outside. Use 1 ounce, which would fill a shot glass.",
    2: "Reapply sunscreen at least every 80 minutes, or more often if you're sweating or swimming.",
    3: "Wear sunglasses with total UV protection.",
    4: "Wear wide-brimmed hats, and long-sleeved shirts and pants.",
    5: "Avoid being out in the sun as much as possible from 10 a.m. to 2 p.m.",
    6: "Check your skin regularly so you know what's normal for you and to notice any changes or new growths.",
    7: "Choose cosmetics and contact lenses that offer UV protection. You still need to use sunscreen and wear sunglasses with broad-spectrum sun protection.",
    8: "If you're a parent, protect your child's skin and practice those habits together.",
    9: "Don't use tanning beds."
  };
  randomNumber = (Math.floor(Math.random() * 9));
  $('#healthTips').html('<p>' + tips[randomNumber] + '</p>');

  $('#newTip').on('click', function(e) {
    randomNumber = (Math.floor(Math.random() * 8 + 1));
    $('#healthTips').html('<p>' + tips[randomNumber] + '</p>');
  });

  // Logout
  $('#logoutbtn').on('click', function() {
    window.localStorage.removeItem("token");
    window.location = "signin.html";
  });

  //apply Sunscreen
  $('#sunscreen-card').hide();
  $('#btnsunscreen').on('click', function(e) {
    $('#sunscreen-card').show();
  });
  $('#cancelSunscreen').on('click', function(e) {
    $('#sunscreen-card').hide();
  });

  $('#submitSunscreen').on('click', function(e) {
    $.ajax({
      url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/uv/sunscreen',
      dataType: 'json',
      type: 'post',
      contentType: 'application/json',
      data: JSON.stringify({
        email: email,
        time: $("#timeSuncreen").val(),
        type: $("#typeSuncreen").val()
      }),
      success: function(data, textStatus, jQxhr) {
        alert(data.message);
        $('#sunscreen-card').hide();
      },
      error: function(jqXhr, textStatus, errorThrown) {
        alert(jqXhr.responseJSON.message + ", registration fail!");
      }
    });
  });

  // UV arounded
  $('#findCityUV').on('click', function(e) {
    if ($('#city').val() !== "") {
      var requestData = {
        "city": $('#city').val()
      };
    } else if ($('#zipcode').val() !== "") {
      var requestData = {
        "postal_code": $('#zipcode').val()
      };
    } else {
      alert("you must enter city or zipcode");
      return;
    }
    $.get("https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/uv/cityuv", requestData, function(data) {
      $('#cityUV').html("<h1>" + data.uv + "</h1>");
    }, "json");
  });


});
