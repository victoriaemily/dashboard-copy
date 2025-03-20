function draw_core_usage_chart(core_util_data) {
  let chartCanvas = document.getElementById("core_utilization_chart");
  if (chartCanvas == null) {
    return;
  }

  var core_util_chart = chartCanvas.getContext('2d');

  used_core = core_util_data["allocated"]
  free_core = core_util_data["idle"]

  var data2 = {
    labels: ["Allocated", "Idle"],
    datasets: [{
      backgroundColor: [
        "#500000",
        "#A9A9A9"
      ],
      data: [used_core, free_core]
    }]
  };
  var options2 = {
    maintainAspectRatio: false,
    responsive: true,
    title: {
      display: true,
      text: 'Core Utilization',
      fontColor: '#500000',
      fontStyle: 'bold',
      fontSize: 20
    },
    legend: {
      display: false
    },
    tooltips: {
      callbacks: {
        label: function(tooltipItem, data) {
        	var dataset = data.datasets[tooltipItem.datasetIndex];
          var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
          return previousValue + currentValue;
          });
          var currentValue = dataset.data[tooltipItem.index];
          var percentage = Math.floor(((currentValue/total) * 100)+0.5);         
          return currentValue + "/" + total + " " + "(" + percentage + "%)";
        }
      }
    }
  };

  var core_chart = new Chart(core_util_chart, {
    type: 'doughnut',
    data:  data2,
    options: options2
  });
}

function show_loading_indicator(chart_id) {
  var canvas = document.getElementById(chart_id);
  var context = canvas.getContext('2d');
  var start = new Date();
  var lines = 16,
    cW = context.canvas.width,
    cH = context.canvas.height;

  var draw = function () {
    var rotation = parseInt(((new Date() - start) / 1000) * lines) / lines;
    context.save();
    context.clearRect(0, 0, cW, cH);
    context.translate(cW / 2, cH / 2);
    context.rotate(Math.PI * 2 * rotation);
    for (var i = 0; i < lines; i++) {

      context.beginPath();
      context.rotate(Math.PI * 2 / lines);
      context.moveTo(cW / 10, 0);
      context.lineTo(cW / 4, 0);
      context.lineWidth = cW / 30;
      context.strokeStyle = "rgba(255,255,255," + i / lines + ")";
      context.stroke();
    }
    context.restore();
  };
  window.setInterval(draw, 1000 / 30);
}

function draw_node_usage_chart(node_util_data) {
  let canvasElem = document.getElementById("node_utilization_chart");
  if (canvasElem == null) {
    return;
  }

  var node_util_chart = canvasElem.getContext('2d');

  // node
  let used_nodes = node_util_data["allocated"];
  let mixed_nodes = node_util_data["mixed"];
  let idle_nodes = node_util_data["idle"];
  let util_data = [used_nodes,mixed_nodes,idle_nodes];

  const data2 = {
    labels: ["Allocated", "Mixed", "Idle"],
      datasets: [{
        backgroundColor: [
          "#500000",
          "#998542",
          "#A9A9A9",
        ],
        data: util_data
      }]
  };

  const options2 = {
    maintainAspectRatio: false,
    responsive: true,
    title: {
      display: true,
      text: 'Node Utilization',
      fontColor: '#500000',
      fontStyle: 'bold',
      fontSize: 20
    },
    legend: {
      display: false
    },
    tooltips: {
      callbacks: {
        label: function(tooltipItem, data) {
        	var dataset = data.datasets[tooltipItem.datasetIndex];
          var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
          return previousValue + currentValue;
          });
          var currentValue = dataset.data[tooltipItem.index];
          var percentage = Math.floor(((currentValue/total) * 100)+0.5);         
          return currentValue + "/" + total + " " + "(" + percentage + "%)";
        }
      }
    }
  }

  let node_chart = new Chart(node_util_chart, {
    type: 'doughnut',
    data: data2,
    options: options2
  });

  
}

function hide_spinner() {
  let spinners = document.getElementsByClassName('chart-loading-indicator');
  if (spinners== null) {
    return;
  }

  while (spinners[0]) {
    spinners[0].parentNode.removeChild(spinners[0]);
  }
}

function populate_jobs_stats_table(job_data) {
  let num_pending_jobs = job_data['pending'];
  let num_running_jobs = job_data['running'];

  if (num_pending_jobs == null || num_running_jobs == null) {
    return;
  }

  var job_stats_table = document.getElementById('job_stats_table');
  if (job_stats_table == null) {
    return;
  }
  var table_body = job_stats_table.getElementsByTagName('tbody')[0];
  var running_job_row = table_body.insertRow(0);
  var titleCell = running_job_row.insertCell(0);
  var dataCell = running_job_row.insertCell(1);
  titleCell.innerHTML = "Running";
  dataCell.innerHTML = num_running_jobs;

  var pending_job_row = table_body.insertRow(1);
  var titleCell = pending_job_row.insertCell(0);
  var dataCell = pending_job_row.insertCell(1);
  titleCell.innerHTML = "Pending";
  dataCell.innerHTML = num_pending_jobs;
}

function setup_utilization_chart(json_data) {
  data = json_data["data"];

  node_util_data = data["nodes"];
  core_util_data = data["cores"];
  jobs_stats_data = data["jobs"];

  draw_core_usage_chart(core_util_data);
  draw_node_usage_chart(node_util_data);
  populate_jobs_stats_table(jobs_stats_data);
  hide_spinner();
}

(() => {
  let request_url = document.dashboard_url + "/resources/cluster/utilization";

  var util_request = $.getJSON(request_url, { format: "json" })
    .done(function (json_data) {
      setup_utilization_chart(json_data);
    })
    .fail(function (jqxhr, textStatus, error) {
      console.log(jqxhr);
      var err = textStatus + ", " + error;
      console.log("Request Failed: " + err);
    })
    .always(function () {
      // console.log( "complete" );
    });

})()