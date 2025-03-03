
var BrowseUsersSelectedID = -1;
var BrowseUsersSelectedStatus = "";
function browse_users_table_refresh()
{
	var table = document.getElementById("browse-users-table");
	var rows = table.rows;
	while (rows.length > 1)
	{
		table.deleteRow(1);
	}

	var url = "http://localhost:5000/BrowseUsersTable";
	if (ID != -1) { url += "%" + ID; }
	var xhl_req = new XMLHttpRequest();
	xhl_req.open("GET", url, false);	//	gives console warning
	xhl_req.send(null);

	console.log("'" + xhl_req.responseText + "'");
	var data = JSON.parse(xhl_req.responseText);
	for (var i = 0; i < data.length; i++)
	{
		var row = table.insertRow(i + 1);
		var cell_id = row.insertCell(0);
		var cell_user = row.insertCell(1);
		var cell_status = row.insertCell(2);

		var func = new Function("browse_users_table_row_func(" + (i + 1) + ");");
		row.onclick = func;

		cell_id.textContent = data[i].ID;
		cell_user.textContent = data[i].User;
		cell_status.textContent = data[i].Status;
	}

	var label_your_ID = document.getElementById("browse-users-your-ID");
	var label_count = document.getElementById("browse-users-count");
	label_your_ID.textContent = ID;
	label_count.textContent = data.length;

	browse_users_table_row_func(-1);
}
function browse_users_table_row_func(rowIdx)
{
	var table = document.getElementById("browse-users-table");
	var rows = table.rows;
	for (var i = 0; i < rows.length; i++)
	{
		if (i == rowIdx)
			rows[i].style.backgroundColor = "#777777";
		//else if (rows[i].cells[0].textContent == ID)
		//	rows[i].style.backgroundColor = "#00FF00";
		else if (i % 2 == 0)
			rows[i].style.backgroundColor = "#DDDDDD";
		else
			rows[i].style.backgroundColor = "#EEEEEE";
	}

	var button_invite = document.getElementById("browse-users-button-invite");
	var button_accept = document.getElementById("browse-users-button-accept");
	if (rowIdx != -1)
	{
		var row = table.rows[rowIdx];
		BrowseUsersSelectedID = row.cells[0].textContent;
		BrowseUsersSelectedStatus = row.cells[2].textContent;
		//if (BrowseUsersSelectedID != ID)
		{
			//	different user selected
			button_invite.disabled = false;
			button_accept.disabled = true;
		}
		/*else
		{
			//	self selected
			BrowseUsersSelectedID = -1;
			BrowseUsersSelectedStatus = "";
			button_invite.disabled = true;
			button_accept.disabled = true;
		}*/
	}
	else
	{
		//	nothing selected
		BrowseUsersSelectedID = -1;
		BrowseUsersSelectedStatus = "";
		button_invite.disabled = true;
		button_accept.disabled = true;
	}
}
function browse_users_invite()
{
	if (ws == null)
		return;
	if (BrowseUsersSelectedID == -1)
		return;
	ws.send("InviteRequestTo: " + BrowseUsersSelectedID);
}
function browse_users_accept()
{
	if (ws == null)
		return;
	if (BrowseUsersSelectedID == -1)
		return;
}
