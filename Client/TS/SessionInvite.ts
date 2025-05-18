import * as api from './API_Const.js';
import * as ws from './WebSockert.js';
import { TableUser } from './TableUser.js';



let TableOnline = new TableUser("user-table-online", Online_Table_Select);
export function Online_Table_Update(json: any)
{
	TableOnline.update(json);
	Invite_Set(TableOnline.findID(UsersInvitedID));
}
function Online_Table_Select(event: MouseEvent)
{
	TableOnline.select(event);
	(document.getElementById("invite-button-invite") as HTMLButtonElement).disabled = (TableOnline.selected_idx == -1);
}



var UsersInvitedID = -1;
var UsersInvitedName = "";
var UsersInvitedStatus = "";
export function Invite_Set(idx: number)
{
	const id = UsersInvitedID;

	let button_cancel = document.getElementById("invite-button-cancel") as HTMLButtonElement;
	let invite_id = document.getElementById("invite-id") as HTMLElement;
	let invite_name = document.getElementById("invite-name") as HTMLElement;
	let invite_status = document.getElementById("invite-status") as HTMLElement;

	if (idx != -1)
	{
		let row = TableOnline.table.tBodies[0].rows[idx];

		UsersInvitedID = Number.parseInt(row.cells[0].textContent as string);
		UsersInvitedName = row.cells[1].textContent as string;
		UsersInvitedStatus = row.cells[2].textContent as string;

		button_cancel.disabled = false;
		invite_id.textContent = UsersInvitedID.toString();
	}
	else
	{
		UsersInvitedID = -1;
		UsersInvitedName = "";
		UsersInvitedStatus = "";

		button_cancel.disabled = true;
		invite_id.textContent = "";
	}
	invite_name.textContent = UsersInvitedName;
	invite_status.textContent = UsersInvitedStatus;

	if (id != UsersInvitedID)
	{
		ws.WebSocket_Send(api.USER_INVITE_Request_ID + UsersInvitedID);
	}
}



let TableInvites = new TableUser("user-table-invite", Invite_Table_Select);
export function Invite_Table_Update(text: string)
{
	TableInvites.update(JSON.parse(text));
}
function Invite_Table_Select(event: MouseEvent)
{
	TableInvites.select(event);
	(document.getElementById("invite-button-accept") as HTMLButtonElement).disabled = (TableInvites.selected_idx == -1);
}



function Invite_Invite()
{
	Invite_Set(TableOnline.selected_idx);
}
function Invite_Cancel()
{
	Invite_Set(-1);
}
function Invite_Accept()
{
	if (TableInvites.selected_idx != -1)
	{
		ws.WebSocket_Send(api.USER_INVITE_Accept_ID + TableInvites.selected_id);
	}
}

(document.getElementById("invite-button-invite") as HTMLButtonElement).onclick = Invite_Invite;
(document.getElementById("invite-button-cancel") as HTMLButtonElement).onclick = Invite_Cancel;
(document.getElementById("invite-button-accept") as HTMLButtonElement).onclick = Invite_Accept;
