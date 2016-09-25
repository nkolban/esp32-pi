"use strict";

var five = require("johnny-five");
var Raspi = require("raspi-io");

var ESP32_EN;
var ESP32_IO0;

var express = require("express");
var app = express();
var expressWs = require("express-ws")(app);
var wsConsole = null;

app.use(express.static("."));
app.get("/flash", function(request, response) {
	console.log("Request to flash!");
	response.end();
	rebootFlash();
});
app.get("/reboot", function(request, response) {
	console.log("Request to reboot!");
	response.end();
	rebootRun();
});
app.ws("/console", function(ws, req) {
	console.log("Request for console!");
	wsConsole = ws;
	ws.on('message', function(msg) {
		// Handle the message here
		console.log("Web socket message received!");
	});
	ws.on("close", function() {
		console.log("Closed!");
		wsConsole = null;
	});
});

var board = new five.Board({
	io: new Raspi()
});
 
board.on('ready', function() {
	// do Johnny-Five stuff 
	console.log("Board ready!");
	ESP32_EN = new five.Pin("GPIO17", {"mode": five.Pin.OUTPUT});
	ESP32_IO0 = new five.Pin("GPIO27", {"mode": five.Pin.OUTPUT});
	ESP32_EN.high();
	ESP32_IO0.high();
	app.listen(3000, function() {
		console.log("ESP32 interface app started on port 3000");
	});
	rebootFlash();
});

var SerialPort = require("serialport");
var port = new SerialPort("/dev/ttyUSB0", {
	baudRate: 115200
});
port.on("open", function() {
	console.log("Serial port is now open!");
});
port.on("error", function(err) {
	console.log("Serial port reported an error: " + err);
});
port.on("close", function() {
	console.log("Serial port was closed");
	setTimeout(function() {
		port.open();
	}, 1000);
});
port.on("data", function(buffer) {
	process.stdout.write(buffer.toString());
	if (wsConsole !== null) {
		wsConsole.send(buffer.toString());
	}
});

function rebootFlash() {
	ESP32_IO0.low();
	ESP32_EN.low();
	setTimeout(function() {ESP32_EN.high();}, 200);
}

function rebootRun() {
	console.log("rebootRun()");
	ESP32_IO0.high();
	ESP32_EN.low();
	setTimeout(function() {ESP32_EN.high();}, 200);
}
