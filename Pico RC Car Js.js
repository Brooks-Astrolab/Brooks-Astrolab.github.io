// Replace with your Pico W's IP address
const PICO_IP = "http://192.168.1.100"; // Example IP

//Set up a Wifi Connection
function submitWifiCredentials() {
  const ssid = document.getElementById("wifi-ssid").value.trim();
  const password = document.getElementById("wifi-password").value.trim();

  if (!ssid || !password) {
    document.getElementById("wifi-feedback").innerText = "Both fields required.";
    return;
  }

  fetch(`${PICO_IP}/wifi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ssid, password })
  })
  .then(res => res.text())
  .then(data => {
    document.getElementById("wifi-feedback").innerText = data;
  })
  .catch(err => {
    document.getElementById("wifi-feedback").innerText = "Error sending credentials.";
    console.error(err);
  });
}

//Define arrows
const arrowCommands = {
  "arrow-up": "forward",
  "arrow-right": "right",
  "arrow-down": "backward",
  "arrow-left": "left",
  "arrow-top-right": "forward-right",
  "arrow-bottom-right": "backward-right",
  "arrow-bottom-left": "backward-left",
  "arrow-top-left": "forward-left"
};

//Send command to Pico
function sendCommand(direction) {
  logTelemetry('Sending command: ' + direction);
  fetch(`${PICO_IP}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ direction })
  })
  .then(response => response.text())
  .then(data => console.log("Response:", data))
  .catch(error => console.error("Error sending command:", error));
}

//Log commands sent from website
const telemetryBuffer = [];
function logTelemetry(message) {
  const timestamp = new Date().toLocaleTimeString();
  const log = `[${timestamp}] ${message}`;

  telemetryBuffer.push(log);

  if (telemetryBuffer.length > 5){
    telemetryBuffer.shift();
  }

  const panel = document.getElementById("telemetry");
  panel.innerHTML = telemetryBuffer.join("<br>");
}

//Track PicoW serial logs
function fetchConsoleLogs() {
  fetch('/logs')
    .then(response => response.json())
    .then(data => {
      const logsDiv = document.getElementById('console-logs');
      logsDiv.innerHTML = data.join('\n');
      logsDiv.scrollTop = logsDiv.scrollHeight; // auto-scroll to bottom
    })
    .catch(err => {
      // Optionally show error inside console logs
      const logsDiv = document.getElementById('console-logs');
      logsDiv.innerHTML = 'Error fetching logs';
      console.error('Failed to fetch logs:', err);
    });
}

//Define that a button is "active" when clicked 
let currentActiveId = null;
function setActiveArrow(id) {
  if (currentActiveId) {
    document.getElementById(currentActiveId).classList.remove("active");
  }
  document.getElementById(id).classList.add("active");
  currentActiveId = id;
}

//Arrows pressed
Object.keys(arrowCommands).forEach(id => {
  document.getElementById(id).addEventListener("click", () => {
    const direction = arrowCommands[id];
    console.log(`Pressed: ${arrowCommands[id]}`); // Simulated action
    setActiveArrow(id); // Visual feedback
    sendCommand(direction);
  });
});

//Stop button press
document.getElementById("stop-button").addEventListener("click", () => {
  console.log("Pressed: stop");
  sendCommand("stop");
  currentActiveId && document.getElementById(currentActiveId).classList.remove("active");
  currentActiveId = null;
});

//Verify connection to device
function updateConnectionStatus(connected) {
  const dot = document.getElementById("status-dot");
  const text = document.getElementById("status-text");

  if (connected) {
    dot.style.backgroundColor = "green";
    text.textContent = "Connected to Pico W";
  } else {
    dot.style.backgroundColor = "red";
    text.textContent = "Disconnected";
  }
}

//Retrieve connection response from Pico
function checkPicoConnection() {
  fetch(`${PICO_IP}/ping`, { method: "GET" })
    .then(response => {
      if (response.ok) {
        updateConnectionStatus(true);
      } else {
        updateConnectionStatus(false);
      }
    })
    .catch(error => {
      updateConnectionStatus(false);
    });
}

// Run connection check every 3 seconds
setInterval(checkPicoConnection, 3000);
checkPicoConnection(); // Run on load

// Call fetchConsoleLogs every 2 seconds
setInterval(fetchConsoleLogs, 2000);