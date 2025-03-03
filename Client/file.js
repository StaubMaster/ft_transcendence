
ws = null;
ID = -1;
Name = "";
gameID = -1;

function socketConn()
{
	var nameField = document.getElementById("connection-name-field");
	Name = nameField.value;

	if (ws == null)
	{
		ws = new WebSocket("ws");
		ws.binaryType = "arraybuffer";
		ws.onerror = function(e)
		{
			showWebSocketStatus();
			console.log("socket error: ", e);
		};
		ws.onclose = function(e)
		{
			ws = null; showWebSocketStatus();
			ID = -1; showYourID();
			console.log("socket closed:" + e.code + ":" + e.reason);
		};
		ws.onopen = function()
		{
			showWebSocketStatus();
			showYourID();
			ws.send("Change-Name: " + Name);
		};
		ws.onmessage = function(e)
		{
			var cmd_ID = "ID: ";

			var cmd_BallData = "Ball-Data: ";

			var message_to_element = [
				["Session-ID: "     , "session-ID"],
				["Session-State: "  , "session-state"],
				["Session-L-ID: "   , "session-L-ID"],
				["Session-L-Name: " , "session-L-name"],
				["Session-L-Score: ", "session-L-score"],
				["Session-L-State: ", "session-L-state"],
				["Session-R-ID: "   , "session-R-ID"],
				["Session-R-Name: " , "session-R-name"],
				["Session-R-Score: ", "session-R-score"],
				["Session-R-State: ", "session-R-state"],
			];

			var found = false;
			for (var i = 0; i < message_to_element.length; i++)
			{
				var header = message_to_element[i][0];
				var element = message_to_element[i][1];
				if (e.data.startsWith(header))
				{
					var cut = e.data.substring(header.length);
					var elem = document.getElementById(element);
					elem.textContent = cut;
					found = true;
				}
			}
			if (found)
			{
				return;
			}

			if (e.data.startsWith(cmd_ID))
			{
				var cut = e.data.substring(cmd_ID.length);
				ID = cut;
				showYourID();
			}
			else if (e.data.startsWith(cmd_BallData))
			{
				var cut = e.data.substring(cmd_BallData.length);
				//console.log(cmd_BallData + "'" + cut + "'");
				BallFunc(cut);
			}
			else
			{
				console.log("message '" + e.data + "'");
			}
		};
	}
}

function socketDisc()
{
	if (ws != null)
	{
		ws.close();
	}
}



function showWebSocketStatus()
{
	var elem = document.getElementById("socketStatus");

	if (ws == null)
	{
		elem.textContent = "null";
	}
	else
	{
		if (ws.readyState == 0) { elem.textContent = "0 (CONNECTING)";}
		else if (ws.readyState == 1) { elem.textContent = "1 (OPEN)";}
		else if (ws.readyState == 2) { elem.textContent = "2 (CLOSING)";}
		else if (ws.readyState == 3) { elem.textContent = "3 (CLOSED)";}
		else { elem.textContent = ws.readyState + " (UNKNOWN)";}
	}
}

function showYourID()
{
	var elem = document.getElementById("socketID");
	elem.textContent = ID;
}



function InviteFunc()
{
	if (ws == null)
		return;
	elem = document.getElementById("InviteOtherID");
	if (elem == null)
		return;
	var invID = elem.value;
	ws.send("InviteRequestTo: " + invID);
}



function AcceptFunc()
{
	if (ws == null)
		return;

}



function I_Am_Here()
{
	if (ws != null)
	{
		ws.send("I-Am-Here");
	}
}
