import * as api from './Help/API_Const.js';
import * as logIO from './logIO.js';
import * as invite from './invite.js';
import * as userData from './user_data.js';



var ws = null;
WebSocket_Connect();
function WebSocket_Connect()
{
	if (ws != null) { return; }

	ws = new WebSocket("wss");
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
		logIO.AccountChangeLogOut();
		invite.borwser_users_invite_clear();
	};
	ws.onmessage = function(e)
	{
		WebSocket_Message(e.data);
	};
}
window.WebSocket_Connect = WebSocket_Connect;



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
	console.log("Session Start");
	document.getElementById("session").style.display = "block";
	document.getElementById("not-session").style.display = "none";
	browse_users_table_select(-1);
	invite.users_invite_set(-1);
	invite_users_table_select(-1);
}
function Session_End()
{
	console.log("Session End");
	document.getElementById("session").style.display = "none";
	document.getElementById("not-session").style.display = "block";
}

function User_Table(text)
{
	invite.browse_users_table_ws_recv(text);
}



function WebSocket_Message(text)
{
	const message_to_element = [
		[api.USER_ACCOUNT_ID,   "logged-id-label"],
		[api.USER_ACCOUNT_Name, "logged-name-label"],



		[api.SESSION_State,   "session-state"],

		[api.SESSION_L_ID,    "session-L-ID"],
		[api.SESSION_L_Name,  "session-L-name"],
		[api.SESSION_L_Score, "session-L-score"],
		[api.SESSION_L_State, "session-L-state"],

		[api.SESSION_R_ID,    "session-R-ID"],
		[api.SESSION_R_Name,  "session-R-name"],
		[api.SESSION_R_Score, "session-R-score"],
		[api.SESSION_R_State, "session-R-state"],
	];
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
		}
	}

	const message_to_func_value = [
		[api.ALL_USERS_Table,          User_Table],
		[api.USER_ACCOUNT_LOG_INFO,    logIO.AccountChangeInfo],
		[api.USER_INVITE_Table,        invite.invite_users_table_ws_recv],
		[api.USER_SEARCH_USER_DATA,    user_data_show],
		[api.USER_SEARCH_SESSION_DATA, user_data_session_show],
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
		[api.USER_ACCOUNT_LOGIN,         logIO.AccountChangeLogIn],
		[api.USER_ACCOUNT_LOGOUT,        logIO.AccountChangeLogOut],
		[api.SESSION_Start, Session_Start],
		[api.SESSION_End,   Session_End],
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

export function WebSocket_Send(text)
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
window.WebSocket_Send = WebSocket_Send;
