

var BrowseUsersSelectedIndex = -1;
var BrowseUsersSelectedID = -1;
function browse_users_table_ws_recv(text)
{
	user_table_clear("browse-users-table");
	user_table_list("browse-users-table", text, "browse_users_table_select");

	BrowseUsersSelectedIndex = browse_users_table_find_ID_in_table(BrowseUsersSelectedID);
	if (BrowseUsersSelectedIndex == -1)
	{
		BrowseUsersSelectedID = -1;
	}
	user_table_select("browse-users-table", BrowseUsersSelectedIndex);

	var idx = browse_users_table_find_ID_in_table(UsersInvitedID);
	users_invite_set(idx);
}
function browse_users_table_find_ID_in_table(id)
{
	if (id == -1) { return -1; }
	const table = document.getElementById("browse-users-table");
	const rows = table.rows;
	for (var i = 0; i < rows.length; i++)
	{
		const cells = rows[i].cells;
		if (cells[0].textContent == id)
		{
			return i;
		}
	}
	return -1;
}
function browse_users_table_select(rowIdx)
{
	user_table_select("browse-users-table", rowIdx);
	BrowseUsersSelectedIndex = rowIdx;

	var button_invite = document.getElementById("browse-users-button-invite");
	if (rowIdx != -1)
	{
		button_invite.disabled = false;

		var table = document.getElementById("browse-users-table");
		BrowseUsersSelectedID = table.rows[rowIdx].cells[0].textContent;
	}
	else
	{
		button_invite.disabled = true;
		BrowseUsersSelectedID = -1;
	}
}



var UsersInvitedID = -1;
var UsersInvitedName = "";
var UsersInvitedStatus = "";
function users_invite_set(idx)
{
	const id = UsersInvitedID;

	var button_cancel = document.getElementById("browse-users-button-cancel");
	if (idx != -1)
	{
		var table = document.getElementById("browse-users-table");
		UsersInvitedID = table.rows[idx].cells[0].textContent;
		UsersInvitedName = table.rows[idx].cells[1].textContent;
		UsersInvitedStatus = table.rows[idx].cells[2].textContent;
		button_cancel.disabled = false;
	}
	else
	{
		UsersInvitedID = -1;
		UsersInvitedName = "";
		UsersInvitedStatus = "";
		button_cancel.disabled = true;
	}
	document.getElementById("invite-user-id").textContent = UsersInvitedID;
	document.getElementById("invite-user-name").textContent = UsersInvitedName;
	document.getElementById("invite-user-status").textContent = UsersInvitedStatus;

	if (id != UsersInvitedID)
	{
		WebSocket_Send("Invite-Request-ID: " + UsersInvitedID);
	}
}
function browse_users_invite()
{
	if (BrowseUsersSelectedIndex != -1)
	{
		users_invite_set(BrowseUsersSelectedIndex);
	}
}



var InviteUsersSelectedIndex = -1;
var InviteUsersSelectedID = -1;
function invite_users_table_ws_recv(text)
{
	user_table_clear("browse-invite-table");
	user_table_list("browse-invite-table", text, "invite_users_table_select");

	InviteUsersSelectedIndex = browse_users_table_find_ID_in_table(InviteUsersSelectedID);
	if (InviteUsersSelectedIndex == -1)
	{
		InviteUsersSelectedID = -1;
	}
	user_table_select("browse-invite-table", InviteUsersSelectedIndex);

	//var idx = browse_users_table_find_ID_in_table(UsersInvitedID);
	//users_invite_set(idx);
}
function invite_users_table_select(rowIdx)
{
	user_table_select("browse-invite-table", rowIdx);
	InviteUsersSelectedIndex = rowIdx;

	var button_accept = document.getElementById("browse-users-button-accept");
	if (rowIdx != -1)
	{
		button_accept.disabled = false;

		var table = document.getElementById("browse-invite-table");
		InviteUsersSelectedID = table.rows[rowIdx].cells[0].textContent;
	}
	else
	{
		button_accept.disabled = true;
		InviteUsersSelectedID = -1;
	}
}
function browse_invite_accept()
{
	if (InviteUsersSelectedIndex != -1)
	{
		WebSocket_Send("Invite-Accept-ID: " + InviteUsersSelectedID);
	}
}
