
ws = null;
ID = -1;
Name = "";
gameID = -1;

function socketConn()
{
	var nameField = document.getElementById("connection-name-field");
	Name = nameField.value;
	console.log(Name);

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

			var cmd_SessionID = "Session-ID: ";
			var cmd_SessionState = "Session-State: ";

			var cmd_SessionLID = "Session-L-ID: ";
			var cmd_SessionLName = "Session-L-Name: ";
			var cmd_SessionLScore = "Session-L-Score: ";
			var cmd_SessionLState = "Session-L-State: ";

			var cmd_SessionRID = "Session-R-ID: ";
			var cmd_SessionRName = "Session-R-Name: ";
			var cmd_SessionRScore = "Session-R-Score: ";
			var cmd_SessionRState = "Session-R-State: ";

			if (e.data.startsWith(cmd_ID))
			{
				var cut = e.data.substring(cmd_ID.length);
				console.log(cmd_ID + "'" + cut + "'");
				ID = cut;
				showYourID();
			}

			else if (e.data.startsWith(cmd_BallData))
			{
				var cut = e.data.substring(cmd_BallData.length);
				console.log(cmd_BallData + "'" + cut + "'");
			}



			else if (e.data.startsWith(cmd_SessionID))
			{
				var cut = e.data.substring(cmd_SessionID.length);
				var elem = document.getElementById("session-ID");
				elem.textContent = cut;
			}
			else if (e.data.startsWith(cmd_SessionState))
			{
				var cut = e.data.substring(cmd_SessionState.length);
				var elem = document.getElementById("session-state");
				elem.textContent = cut;
			}

			else if (e.data.startsWith(cmd_SessionLID))
			{
				var cut = e.data.substring(cmd_SessionLID.length);
				var elem = document.getElementById("session-L-ID");
				elem.textContent = cut;
			}
			else if (e.data.startsWith(cmd_SessionLName))
			{
				var cut = e.data.substring(cmd_SessionLName.length);
				var elem = document.getElementById("session-L-name");
				elem.textContent = cut;
			}
			else if (e.data.startsWith(cmd_SessionLScore))
			{
				var cut = e.data.substring(cmd_SessionLScore.length);
				var elem = document.getElementById("session-L-score");
				elem.textContent = cut;
			}
			else if (e.data.startsWith(cmd_SessionLState))
			{
				var cut = e.data.substring(cmd_SessionLState.length);
				var elem = document.getElementById("session-L-state");
				elem.textContent = cut;
			}

			else if (e.data.startsWith(cmd_SessionRID))
			{
				var cut = e.data.substring(cmd_SessionRID.length);
				var elem = document.getElementById("session-R-ID");
				elem.textContent = cut;
			}
			else if (e.data.startsWith(cmd_SessionRName))
			{
				var cut = e.data.substring(cmd_SessionRName.length);
				var elem = document.getElementById("session-R-name");
				elem.textContent = cut;
			}
			else if (e.data.startsWith(cmd_SessionRScore))
			{
				var cut = e.data.substring(cmd_SessionRScore.length);
				var elem = document.getElementById("session-R-score");
				elem.textContent = cut;
			}
			else if (e.data.startsWith(cmd_SessionRState))
			{
				var cut = e.data.substring(cmd_SessionRState.length);
				var elem = document.getElementById("session-R-state");
				elem.textContent = cut;
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
