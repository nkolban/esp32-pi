$(function() {
	console.log("jQuery ready!");
	$("#flash").button().click(doFlash);
	$("#reboot").button().click(doReboot);
	$("#openConsole").button().click(function() {
		console.log("Request to open a console!");
		var ws = new WebSocket("ws://" + window.location.hostname + ":" + window.location.port + "/console");
		ws.onmessage = function(messageEvent) {
			console.log("We received data from the server!");
			$("#consoleTextarea").text($("#consoleTextarea").text() + messageEvent.data);
			if ($("#followCheckbox").is(":checked")) {
				$('#consoleTextarea').scrollTop($('#consoleTextarea')[0].scrollHeight);
			}
		};
		ws.onerror = function(error) {
			console.log("Error detected in web socket!");
		};
		ws.onclose = function() {
			console.log("Web socket closed!");
		};
		ws.onopen = function() {
			console.log("Web socket now open!");
		};
	});
	$("#followCheckbox").checkboxradio();
});

function doFlash() {
	console.log("Do flash!");	
	jQuery.ajax({
		method: "GET",
		url: "/flash"
	});
}

function doReboot() {
	console.log("Do reboot!");
	jQuery.ajax({
		method: "GET",
		url: "/reboot"
	});
}
