// ToDo
// set slider value to 1/nth / if you have 3 players in a mafia game the default will be set to 1/3 -> 33

//
// Function Definitions
//
function loadingToDefault() {
  loadingSection.style.display = "none";
  hostSection.style.display = "flex";
  adminForm.style.display = "block";
}
function loadingToUnavailable() {
  loadingSection.style.display = "none";
  hostSection.style.display = "flex";
  hostOption.style.display = "none";
  adminForm.style.display = "block";
  alert("Please double-check the host-ID.");
}
function loadingToName() {
  loadingSection.style.display = "none";
  hostSection.style.display = "flex";
  hostOption.style.display = "none";
  usernameForm.style.display = "block";
  usernameInput.focus();
}
function connectToAdmin(h) {
  adminConnection = peer.connect(h);
  // Reloads the page if the connection does not open within the next two seconds
  setTimeout(function() {
    if (!adminConnection.open) {
      window.location.reload(1);
    }
  }, 2000);
  adminConnection.on("open", function() {
    loadingToName();
    adminConnection.on("data", function(data) {
      console.log("Received", data);
    });
  });
  adminConnection.on("error", function(err) {
    console.log(err);
  });
}
function openAdminPanel() {
  hostSection.style.display = "none";
  adminSection.style.display = "flex";
}
function openUserPanel() {
  hostSection.style.display = "none";
  userSection.style.display = "flex";
}

//
// DOM Definitions
//
const shareDesc = document.getElementById("shareDesc"); // span with sharing functionality explanation
const peerID = document.getElementById("peerID"); // span showing ID; copies link by clicking on it
const adminLink = document.getElementById("adminLink"); // input storing the value for copying
const hostOption = document.getElementById("hostOption");
const hostnameForm = document.getElementById("hostnameForm");
const hostnameInput = document.getElementById("hostnameInput");
const userOption = document.getElementById("userOption");
const adminForm = document.getElementById("adminForm");
const usernameForm = document.getElementById("usernameForm");
const adminIdInput = document.getElementById("adminIdInput");
const usernameInput = document.getElementById("usernameInput");
const loadingSection = document.getElementById("loading");
const hostSection = document.getElementById("chooseHost");
const adminSection = document.getElementById("adminPanel");
const userSection = document.getElementById("userPanel");

// -
// Get data from URL parameters
// -
const urlParams = new URLSearchParams(window.location.search);
const host = urlParams.get("host");

// -
// Connect to peerjs server and create empty connection array
// -
let connections = [];
let adminConnection;
let adminName;
const peer = new Peer();
peer.on("open", function(id) {
  peerID.innerHTML = id;
  // Generate link to the host session using the generated peerID and store it in dummy input
  adminLink.value = `${window.location.origin}${window.location.pathname}?host=${id}`;
  // Automatically connect client to host if defined in URL
  if (host && host.length == 16) {
    connectToAdmin(host);
  } else {
    loadingToDefault();
  }
});
peer.on("error", function(err) {
  console.log(err.type);
  console.log(err);
  if (err.type == "peer-unavailable") {
    loadingToUnavailable();
    adminIdInput.value = host;
    adminIdInput.focus();
  }
});

// Change share-description for mobile devices
if (navigator.share) {
  shareDesc.innerHTML = "Tap to share host-link:";
}

// Copy sharable link
peerID.onclick = function() {
  if (navigator.share) {
    navigator
      .share({
        title: "RL Mafia Host Link",
        url: adminLink.value
      })
      .then(() => {
        console.log("Link shared.");
      })
      .catch(console.error);
  } else {
    adminLink.select();
    document.execCommand("copy");
    console.log("Link copied.");
  }
};

// -
// For Host: Functions for when a user connects to the host peer
//
peer.on("connection", peerConnected);
function peerConnected(dataConnObj) {
  dataConnObj.on("open", function() {
    dataConnObj.on("data", function(data) {
      if (data.username) {
        connections[data.username] = dataConnObj;
        document.getElementById(
          "players"
        ).innerHTML += `<div class="player" id="${data.username}">${data.username} <span class="kick" onclick="kickUser('${data.username}')">&#x1F44B</span></div>`;
      } else {
      }
    });
  });
  // $("#rid").val(c.peer);
  // $("#rid").prop("disabled", true);
  // $("#progBar").width("100%");
  // c.on("data", function(data) {
  //   $("#inputText").val($("#inputText").val() + data);
  // });
  // c.on("close", disconnect);
}
hostnameForm.onsubmit = function() {
  event.preventDefault();
  if (hostnameInput.value != "" && hostnameInput.value.match(/^\w+$/)) {
    adminConnection = false;
    adminName = hostnameInput.value;
    openAdminPanel();
  } else {
    alert("Please only use alphanumeric values or underscores.");
  }
};
function kickUser(u) {
  // !!! disconnect(user);
  delete connections[u];
  document.getElementById(u).remove();
}

//
// For Users: Create connection logic for all other clients that are not admin/host
//
adminIdInput.focus();
adminForm.onsubmit = function() {
  event.preventDefault();
  connectToAdmin(adminIdInput.value);
};
usernameForm.onsubmit = function() {
  event.preventDefault();
  if (usernameInput.value != "" && usernameInput.value.match(/^\w+$/)) {
    adminConnection.send({ username: usernameInput.value });
    openUserPanel();
  } else {
    alert("Please only use alphanumeric values or underscores.");
  }
};

// function disconnect(c) {
//   if (c.peer) {
//     c.peer = null;
//     c.close();
//     alert("You are no longer connected to the server!");
//     $("#rid").val("");
//     $("#rid").prop("disabled", false);
//     $("#progBar").width("0%");
//     $("#inputText").val("");
//   }
// }

// $().ready(function() {
//   $("#connect").click(function() {
//     $("#progBar").css("width", "50%");
//     var c = peer.connect($("#rid").val());
//     c.on("open", function() {
//       connect(c);
//     });
//   });
//   $("#disconnect").click(function() {
//     $("#progBar").css("width", "50%");
//     disconnect();
//   });
// $("#inputText").keypress(function(e) {
//   Object.keys(connections).forEach(sendJSONtoPeer);
//   function sendJSONtoPeer(index) {
//     var ev = e || window.event;
//     var asciiKey = ev.keyCode || ev.which;
//     text = String.fromCharCode(asciiKey);
//     connections[index].send("ayee");
//   }
// });
// });

// --
// Linking slider and text input for probability value
//
const probSlider = document.getElementById("probSlider");
const probText = document.getElementById("probText");
probSlider.onchange = function() {
  probText.value = this.value;
};
probText.onchange = function() {
  probSlider.value = this.value;
};
