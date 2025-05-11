
function user_data_search()
{
	const search_id = document.getElementById("user-data-search-id").value;
	WebSocket_Send("User-Data-Search-ID: " + search_id);
}

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
