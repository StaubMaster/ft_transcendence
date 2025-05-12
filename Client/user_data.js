import * as api from './Help/API_Const.js';
import * as SessionTable from './generic_session_table.js';



function user_data_search()
{
	const search_id = document.getElementById("user-data-search-id").value;
	WebSocket_Send(api.USER_DATA_SEARCH_ID + search_id);
	WebSocket_Send(api.SEARCH_SESSIONS_LIST_USER_ID + search_id);
}
window.user_data_search = user_data_search;

function user_data_show(text)
{
	if (text.length == 0)
	{
		document.getElementById("user-data-id").textContent = "";
		document.getElementById("user-data-name").textContent = "";
		document.getElementById("user-data-status").textContent = "";
		document.getElementById("user-data-search-info").textContent = "User not found";
	}
	else
	{
		const data = JSON.parse(text);
		document.getElementById("user-data-id").textContent = data.ID;
		document.getElementById("user-data-name").textContent = data.Name;
		document.getElementById("user-data-status").textContent = data.Status;
		document.getElementById("user-data-search-info").textContent = "User found";
	}
}
window.user_data_show = user_data_show;

function user_data_session_show(text)
{
	var table = document.getElementById("user-data-sessions");
	SessionTable.clear(table);
	SessionTable.show(table, text);
}
window.user_data_session_show = user_data_session_show;
