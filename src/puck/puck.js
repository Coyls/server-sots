var noble = require('@abandonware/noble');
const WebSocket = require('ws');

// List of allowed devices
const devices = [
  "ed:0d:64:c9:a2:e5",
  "c7:f8:6b:2d:52:46"
];
// last advertising data received
var lastAdvertising = {
};

const ws = new WebSocket("ws://localhost:3000");

const INIT_MESSAGE = {
  type: "INIT",
  data: {
    name : "puck"
  }
}

ws.addEventListener('open', function (event) {
  ws.send(JSON.stringify(INIT_MESSAGE));
});

function onDeviceChanged(addr, data) {
  const CLICK_MESSAGE = {
    type: "CLICK",
    data: {
      id: addr
    }
  }
  console.log("Device ", addr, "changed data", JSON.stringify(data));
  ws.send(JSON.stringify(CLICK_MESSAGE));
}

function onDiscovery(peripheral) {
  // do we know this device?
  if (devices.indexOf(peripheral.address) < 0) return;
  // does it have manufacturer data with Espruino/Puck.js's UUID
  if (!peripheral.advertisement.manufacturerData ||
    peripheral.advertisement.manufacturerData[0] != 0x90 ||
    peripheral.advertisement.manufacturerData[1] != 0x05) return;
  // get just our data
  var data = peripheral.advertisement.manufacturerData.slice(2);
  // check for changed services
  if (lastAdvertising[peripheral.address] != data.toString())
    onDeviceChanged(peripheral.address, data);
  lastAdvertising[peripheral.address] = data;
}

noble.on('stateChange', function (state) {
  if (state != "poweredOn") return;
  console.log("Starting scan...");
  noble.startScanning([], true);
});
noble.on('discover', onDiscovery);
noble.on('scanStart', function () { console.log("Scanning started."); });
noble.on('scanStop', function () { console.log("Scanning stopped."); });