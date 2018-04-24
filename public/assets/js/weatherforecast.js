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

  // Require Weather Information
  function requireWeather() {

    $.ajax({
      url: 'https://ec2-18-221-206-206.us-east-2.compute.amazonaws.com:8080/uv/weather',
      dataType: 'json',
      type: 'post',
      headers: {
        "X-Auth": token
      },
      contentType: 'application/json',
      data: JSON.stringify({
        lat: $('#lat').val(),
        lon: $('#lon').val()
      }),
      success: function(data, textStatus, jQxhr) {
        $('#weatherData').html("<p>UV values:</p><ul><li>" + data.uv1 + "</li><li>" + data.uv2 + "</li><li>" + data.uv3 + "</li><li>" + data.uv4 + "</li><li>" + data.uv5 + "</li></ul>" +
          "<p>temperature:</p><ul><li>" + data.temp1 + "</li><li>" + data.temp2 + "</li><li>" + data.temp3 + "</li><li>" + data.temp4 + "</li><li>" + data.temp5 + "</li></ul>");
        // Chart for UV index
        $("#chartcontainer1").html("<canvas id='myChart1' class='myChart'></canvas>");
        $("#chartcontainer2").html("<canvas id='myChart2' class='myChart'></canvas>");
        var ctx1 = document.getElementById('myChart1').getContext('2d');
        var chart1 = new Chart(ctx1, {
          // The type of chart we want to create
          type: 'bar',
          // The data for our dataset
          data: {
            labels: [data.date1, data.date2, data.date3, data.date4, data.date5],
            datasets: [{
              label: "UV Index",
              backgroundColor: 'rgba(66, 167, 244,0.6)',
              borderColor: 'rgba(66, 167, 244,0.6)',
              data: [data.uv1, data.uv2, data.uv3, data.uv4, data.uv5],
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
                fontColor: 'rgb(66, 167, 244)',
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
                  labelString: 'Date'
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
                  fontSize: 8,
                  min: 0
                }
              }]
            }
          }
        });
        //chart for temp

        var ctx2 = document.getElementById('myChart2').getContext('2d');
        var chart2 = new Chart(ctx2, {
          // The type of chart we want to create
          type: 'line',

          // The data for our dataset
          data: {
            labels: [data.date1, data.date2, data.date3, data.date4, data.date5],
            datasets: [{
              label: "Temperature",
              backgroundColor: 'rgba(255, 91, 10,0.6)',
              borderColor: 'rgb(255, 91, 10)',
              data: [data.temp1, data.temp2, data.temp3, data.temp4, data.temp5],
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
                  labelString: 'Temperature'
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
                  fontSize: 8,
                }
              }]
            }
          }
        });
      },
      error: function(jqXhr, textStatus, errorThrown) {
        console.log(jqXhr);
      }
    });
  }

  userAuth(requireWeather);

  $('#search').on('click', function(e) {
    e.preventDefault();
    requireWeather();
  })

});
