
/*
ws = null;
ID = -1;
Name = "";
gameID = -1;

function WebSocket_ShowStatus()
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
//WebSocket_ShowStatus();

function WebSocket_ShowID()
{
	var elem = document.getElementById("socketID");
	elem.textContent = ID;
}
//WebSocket_ShowID();

function WebSocket_Connect()
{
	if (ws != null)
	{
		console.log("WebSocket_Connect(): already connected");
		return;
	}

	var nameField = document.getElementById("connection-name-field");
	Name = nameField.value;

	ws = new WebSocket("ws");
	ws.binaryType = "arraybuffer";
	ws.onerror = function(e)
	{
		console.log("socket error: ", e);
		WebSocket_ShowStatus();
	};
	ws.onclose = function(e)
	{
		console.log("socket closed:" + e.code + ":" + e.reason);
		ws = null;
		ID = -1;
		WebSocket_ShowStatus();
		WebSocket_ShowID();
	};
	ws.onopen = function()
	{
		WebSocket_ShowStatus();
		ws.send("Change-Name: " + Name);
	};
	ws.onmessage = function(e)
	{
		WebSocket_Message(e.data);
	};
}

function WebSocket_Disconnect()
{
	if (ws == null)
	{
		console.log("WebSocket_Disconnect(): not connected");
		return;
	}

	ws.close();
}*/

ws = null;
autoConnectFunc();
function autoConnectFunc()
{
	ws = new WebSocket("ws");
	ws.binaryType = "arraybuffer";
	ws.onerror = function(e)
	{
		console.log("socket error: ", e);
		//WebSocket_ShowStatus();
	};
	ws.onclose = function(e)
	{
		console.log("socket closed:" + e.code + ":" + e.reason);
		console.log("WS Close");
		ws = null;
	};
	ws.onopen = function()
	{
		console.log("WS Open");
	};
	ws.onmessage = function(e)
	{
		//console.log("'" + e.data + "'");
		WebSocket_Message(e.data);
	};
}



function WebSocket_Message(text)
{
	const message_to_element = [
		["WS-Temp-ID: ", "ws-id-field"],
		["User-ID: "   , "logged-id-label"],
		["User-Name: " , "logged-name-label"],

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
		if (text.startsWith(header))
		{
			var cut = text.substring(header.length);
			var elem = document.getElementById(element);
			elem.textContent = cut;
			return;
			//found = true;
		}
	}
	if (found)
	{
		return;
	}



	if (text.startsWith("LogIn: "))
	{
		const value = text.substring("LogIn: ".length);
		User_LogIn_Change(value);
		return;
	}

	if (text.startsWith("User-Table-List: "))
	{
		const value = text.substring("User-Table-List: ".length);
		browse_users_table_ws_recv(value);
		return;
	}

	const message_to_func = [
		//["LogIn: ", User_LogIn_Succ],
		//["LogIn: Failure", User_LogIn_Fail],
		["LogOut", User_LogOut_Change],
	];
	for (var i = 0; i < message_to_func.length; i++)
	{
		var header = message_to_func[i][0];
		var func = message_to_func[i][1];
		if (text.startsWith(header))
		{
			func();
			return;
		}
	}


	var cmd_ID = "ID: ";
	var cmd_SimulationData = "Simulation-Data: ";

	if (text.startsWith(cmd_ID))
	{
		var cut = text.substring(cmd_ID.length);
		ID = cut;
		WebSocket_ShowID();
	}
	else if (text.startsWith(cmd_SimulationData))
	{
		var cut = text.substring(cmd_SimulationData.length);
		SimulationDataChangeFunc(cut);
	}
	else
	{
		console.log("unrecognized message '" + text + "'");
	}
}

function WebSocket_Send(text)
{
	if (ws == null)
	{
		console.log("WebSocket_Send(): not connected");
		console.log("'", text, "'");
		return;
	}
	else
	{
		ws.send(text);
	}
}
