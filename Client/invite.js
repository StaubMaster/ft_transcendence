import * as api from './Help/API_Const.js';
import * as UserTable from './generic_user_table.js';



var BrowseUsersSelectedIndex = -1;
var BrowseUsersSelectedID = -1;
export function browse_users_table_ws_recv(text)
{
	var table = document.getElementById("browse-users-table");
	UserTable.clear(table);
	UserTable.show(table, text, "browse_users_table_select");
	[BrowseUsersSelectedIndex, BrowseUsersSelectedID] = UserTable.re_select(table, BrowseUsersSelectedIndex, BrowseUsersSelectedID);

	var idx = UserTable.findID(table, UsersInvitedID);
	users_invite_set(idx);
}
function browse_users_table_select(rowIdx)
{
	var table = document.getElementById("browse-users-table");
	[BrowseUsersSelectedIndex, BrowseUsersSelectedID] = UserTable.select(table, rowIdx);
	document.getElementById("browse-users-button-invite").disabled = (rowIdx == -1);
}
window.browse_users_table_select = browse_users_table_select;



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
		WebSocket_Send(api.INVITE_Request_ID + UsersInvitedID);
	}
}
function browse_users_invite_selected()
{
	users_invite_set(BrowseUsersSelectedIndex);
}
export function borwser_users_invite_clear()
{
	users_invite_set(-1);
}
window.browse_users_invite_selected = browse_users_invite_selected;
window.borwser_users_invite_clear = borwser_users_invite_clear;



var InviteUsersSelectedIndex = -1;
var InviteUsersSelectedID = -1;
export function invite_users_table_ws_recv(text)
{
	var table = document.getElementById("browse-invite-table");
	UserTable.clear(table);
	UserTable.show(table, text, "invite_users_table_select");
	[InviteUsersSelectedIndex, InviteUsersSelectedID] = UserTable.re_select(table, InviteUsersSelectedIndex, InviteUsersSelectedID);
}
function invite_users_table_select(rowIdx)
{
	var table = document.getElementById("browse-invite-table");
	[InviteUsersSelectedIndex, InviteUsersSelectedID] = UserTable.select(table, rowIdx);
	document.getElementById("browse-users-button-accept").disabled = (rowIdx == -1);
}
function browse_invite_accept()
{
	if (InviteUsersSelectedIndex != -1)
	{
		WebSocket_Send(api.INVITE_Accept_ID + InviteUsersSelectedID);
	}
}
window.invite_users_table_select = invite_users_table_select;
window.browse_invite_accept = browse_invite_accept;
