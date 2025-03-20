function colorize_percentage_value(percent) {
  if (percent < 30.0) {
    return `${percent} %`.fontcolor('green');
  } else if (percent >= 70.0) {
    return `${percent} %`.fontcolor('red');
  } else {
    return `${percent} %`.fontcolor('orange');
  }
}
function convertStorageToBytes(storage) {
  const units = {
    K: 1024,
    M: 1024 * 1024,
    G: 1024 * 1024 * 1024,
    T: 1024 * 1024 * 1024 * 1024, // Add terabyte unit
    // Add more units as needed (P, E, etc.)
  };
  const storageStr = storage.replace('*', '');
  const match = storageStr.match(/^(\d+(\.\d+)?)\s*([KMGT]?)$/);
  if (!match) {
    throw new Error(`Invalid storage format: ${storageStr}`);
  }

  const value = parseFloat(match[1]);
  const unit = match[3] || 'M'; // Default to MB if no unit is specified

  if (!(unit in units)) {
    throw new Error(`Invalid storage unit: ${unit}`);
  }

  return value * units[unit];
}
function formatStorageValue(usageStr, limitStr) {
  const usageBytes = convertStorageToBytes(usageStr);
  const limitBytes = convertStorageToBytes(limitStr);

  const percent = (usageBytes / limitBytes) * 100;
  return `${usageStr}<br/>(${colorize_percentage_value(percent.toFixed(2))})`;

}

// borrow from this answer: https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatKBytes(data) {
  bytes = data * 1024;
  return formatBytes(bytes);
}

function generate_file_explorer_path_for_disk(disk_name) {
  disk_path = disk_name.trim()
  disk_name=disk_name.split('/')[1]

  if (disk_name == "scratch" && disk_path.split('/')[2]=='group') {
      
      disk_name=disk_path.split('/').slice(2).join('/');
  }

  return `<a target="_blank" style="color:#003C71;font-weight: bold;text-decoration:underline" href="${document.file_app_url + disk_path}">${disk_name}</a>`

}
var quotalimits={}
var filelimits={}
var fileusage={}
var quotausage={}
function check_button(disk_name) {
  
  var disk=disk_name
  
  var disk_name = disk_name.split('/')[1]
  if (disk_name == "home") {
    return '';
  }
  
  return `<button type="button" class="btn btn-primary maroon-button" data-toggle="modal" data-target="#requestQuotaModal" onclick="updateQuotaOnGroupClick('${disk}')" >Request Quota Increase</button>`;
}
function updateQuotaOnGroupClick(group) {
  
  document.getElementById("current_quota").value = formatBytes(convertStorageToBytes(quotalimits[group]));
  document.getElementById("current_file_limit").value = filelimits[group];
  usage=convertStorageToBytes(quotausage[group])
  $("#current_used_disk_quota").val(formatBytes(usage));
  $("#current_used_file").val(fileusage[group]);
  $("#disk_name").val(group);
  // if(group.split('/')[1]=="scratch" && group.split('/')[2]=='group'){
  // $("#disk_name").val(group.split('/')[3]);}
  // if(group.split('/')[1]=="scratch" && group.split('/')[2]=='user'){
  //   $("#disk_name").val(group.split('/')[1]);}

}
// $(document).ready(function() {
//   // Event delegation to capture clicks on dynamically added buttons
//   $('body').on('click', '.maroon-button', function() {
//     $(this).css('background-color', 'white');
//     $(this).css('color', 'maroon');
//   });

// });

function populate_quota() {
  $('#quota_table').DataTable({
    "paging": false,
    "searching": false,
    "info": false,
    "ordering": false,
    "scrolling": false,
    ajax: {
      dataType: "json",
      url: document.dashboard_url + '/resources/disk/quota',
      method: "GET",
    },
    "columns": [{
        "data": "name",
        render: function(disk_name, type, row) {
          return generate_file_explorer_path_for_disk(disk_name);
        }
      },
      {
        "data": "disk_usage", "sClass":  "text-right",
        render: function (data, type, row) {
          return formatStorageValue(row.disk_usage, row.disk_limit)
        }
      },
      {
        "data": "disk_limit", "sClass":  "text-right",
        // render: formatKBytes
      },

      {
        "data": "file_usage", "sClass":  "text-right",
        render: function (data, type, row) {
          
          percent = (parseInt(row.file_usage ,10)/ row.file_limit) * 100
         
          return `${Number(data).toLocaleString()}<br/>(${colorize_percentage_value(percent.toFixed(2))})`;
        }
      },
      {
        "data": "file_limit", "sClass":  "text-right",

        render: function (data, type, row) {
          
         
          return `${Number(data).toLocaleString()}`;
        }
  
      },
      {
        "data": "null",
        "render": function (data, type, row,meta ) {
          return check_button(row['name'])
        },
      }
    ]
  });
}

function setup_quota_request_sender(request_endpoint, form_id, modal_id) {
  // Source: https://developer.mozilla.org/en-US/docs/Learn/Forms/Sending_forms_through_JavaScript
  window.addEventListener("load", function () {
    function sendData() {
      const XHR = new XMLHttpRequest();

      
      document.getElementById('justification-field').value="\n"+"Is the PI aware of this request?"+"\n"+
                                                              document.getElementById('justification-field').value+"\n"+
                                                              "What data is stored with the requested quota?"+"\n"+
                                                              document.getElementById('justification-field1').value+"\n"+
                                                              "Briefly describe the research project that will be supported by the requested storage?"+"\n"+
                                                              document.getElementById('justification-field2').value+"\n"+
                                                              "What is the input/output size of the job?"+"\n"+
                                                              document.getElementById('justification-field3').value+"\n"+
                                                              "What is your long-term storage plan for your data after the quota increase expires?"+"\n"+
                                                              document.getElementById('justification-field4').value
      // var response = "";
      
      // Bind the FormData object and the form element
      const FD = new FormData(form);
      // Define what happens on successful data submission
      XHR.addEventListener("load", function (event) {
        // response = event.target.responseText;
        confirm(event.target.responseText);
        window.location.reload();
      });

      // Define what happens in case of error
      XHR.addEventListener("error", function (event) {
        // response = `Oops! ${event.target.responseText}`;
        confirm(`Oops! ${event.target.responseText}`);
        window.location.reload();
      });

      // Set up our request
      XHR.open("POST", request_endpoint);

      // The data sent is what the user provided in the form
      XHR.send(FD);
    }

    // Access the form element...
    let form = document.getElementById(form_id);
    if (form === null) {
      return;
    }

    // ...and take over its submit event.
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var scratch_storage = form.desired_disk;
      var file_limit = form.total_file_limit;
      if ((!scratch_storage.value) && (!file_limit.value)) {
        alert("Either Scratch Storage or File Limit must be filled");
        return;
      }
      
      // setTimeout(sendData, 3000);
      // const response = sendData();
      sendData();
      // const myTimeout = setTimeout(function () {console.log("Waiting For Form Validation and Submission")}, 5000);
        
      
      
      // dismiss our modal
      // $(modal_id).on('hidden.bs.modal', function (e) {
      //   // $(modal_id + ' form')[0].reset();
      //   $(this)
      //     .find("input,textarea,select")
      //       .val('')
      //       .end()
      //     .find("input[type=checkbox], input[type=radio]")
      //       .prop("checked", "")
      //       .end();
      // });
      $(modal_id).modal('hide');
      // window.location.reload();
    });
  });
}

function populate_request_quota_form(quota) {

}

function setup_quota_request_form(quota_request_endpoint) {
  fetch(quota_request_endpoint)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    var quotas = data['data'];
    // quotas = quotas.filter(quota => quota["name"] === '/scratch');
    var scratch_quota = null;
    quotalimits = {};
    filelimits = {};
    fileusage={}
    quotausage={}
    quotas.forEach(quota => {
      disk_name = quota["name"].trim();
      disk=disk_name.split('/')[1]
      quotalimits[disk_name]=quota.disk_limit
      filelimits[disk_name]=quota.file_limit
      fileusage[disk_name]=quota.file_usage
      quotausage[disk_name]=quota.disk_usage
      if (disk == "scratch" && disk_name.split('/')[2]=='user') {
   
        scratch_quota = quota;
      }
    });
    if (scratch_quota === null) {
      console.error("Cannot fetch scratch quota");
      return;
    }

    // find and set current values of quota and file limit
    var current_disk_quota = document.getElementById("current_quota");
    if (current_disk_quota === null) {
      return;
    }

    limit=convertStorageToBytes(scratch_quota["disk_limit"])
    current_disk_quota.value = formatBytes(limit);
   
    var current_file_limit = document.getElementById("current_file_limit");
    current_file_limit.value = scratch_quota["file_limit"];

    // invisible form components (needs this for RT email)

    usage=convertStorageToBytes(scratch_quota["disk_usage"])
    $("#current_used_disk_quota").val(formatBytes(usage));
    $("#current_used_file").val(scratch_quota["file_usage"]);

  });
}

(() => {
  let quota_request_endpoint = document.dashboard_url + "/request/quota";
  let disk_quota_endpoint = document.dashboard_url + "/resources/disk/quota";

  populate_quota();
  setup_quota_request_sender(quota_request_endpoint, "modalQuotaRequestForm", "#requestQuotaModal");
  setup_quota_request_form(disk_quota_endpoint);
})()