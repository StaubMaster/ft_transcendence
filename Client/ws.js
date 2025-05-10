


ws = null;
WebSocket_Connect();
function WebSocket_Connect()
{
	if (ws != null) { return; }

	ws = new WebSocket("ws");
	ws.binaryType = "arraybuffer";
	ws.onerror = function(e)
	{
		console.log("socket error: ", e);
	};
	ws.onclose = function(e)
	{
		console.log("socket closed:" + e.code + ":" + e.reason);
		ws = null;
		WebSocket_Info("Server Connection Error");
	};
	ws.onopen = function()
	{
		WebSocket_Info();
	};
	ws.onmessage = function(e)
	{
		WebSocket_Message(e.data);
	};
}



function WebSocket_Info(text)
{
	var ws_info = document.getElementById("ws-info");
	var ws_info_head = document.getElementById("ws-info-head");
	if (text === undefined)
	{
		ws_info.style.display = "none";
	}
	else
	{
		ws_info.style.display = "block";
		ws_info_head.textContent = text;
	}
}



function Session_Start()
{
	document.getElementById("session").style.display = "block";
	document.getElementById("not-session").style.display = "none";
	browse_users_table_select(-1);
	users_invite_set(-1);
	invite_users_table_select(-1);
}
function Session_End()
{
	document.getElementById("session").style.display = "none";
	document.getElementById("not-session").style.display = "block";
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



	const message_to_func_value = [
		["Log-Info: ",        User_LogIn_Change],
		["User-Table-List: ", browse_users_table_ws_recv],
		["Invite-Table: ",    invite_users_table_ws_recv],
	];
	for (var i = 0; i < message_to_func_value.length; i++)
	{
		var header = message_to_func_value[i][0];
		var func = message_to_func_value[i][1];
		if (text.startsWith(header))
		{
			const value = text.substring(header.length);
			func(value);
			return;
		}
	}

	const message_to_func = [
		["LogOut", User_LogOut_Change],
		["DeleteMe", User_LogOut_Change],
		["Session-Start", Session_Start],
		["Session-End", Session_End],
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
