import * as api from './API_Const.js';
import * as ws from './WebSockert.js';
import { TableUser } from './TableUser.js';
let TableOnline = new TableUser("user-table-online", Online_Table_Select);
export function Online_Table_Update(json) {
    TableOnline.update(json);
    Invite_Set(TableOnline.findID(UsersInvitedID));
}
function Online_Table_Select(event) {
    TableOnline.select(event);
    document.getElementById("invite-button-invite").disabled = (TableOnline.selected_idx == -1);
}
var UsersInvitedID = -1;
var UsersInvitedName = "";
var UsersInvitedStatus = "";
export function Invite_Set(idx) {
    const id = UsersInvitedID;
    let button_cancel = document.getElementById("invite-button-cancel");
    let invite_id = document.getElementById("invite-id");
    let invite_name = document.getElementById("invite-name");
    let invite_status = document.getElementById("invite-status");
    if (idx != -1) {
        let row = TableOnline.table.tBodies[0].rows[idx];
        UsersInvitedID = Number.parseInt(row.cells[0].textContent);
        UsersInvitedName = row.cells[1].textContent;
        UsersInvitedStatus = row.cells[2].textContent;
        button_cancel.disabled = false;
        invite_id.textContent = UsersInvitedID.toString();
    }
    else {
        UsersInvitedID = -1;
        UsersInvitedName = "";
        UsersInvitedStatus = "";
        button_cancel.disabled = true;
        invite_id.textContent = "";
    }
    invite_name.textContent = UsersInvitedName;
    invite_status.textContent = UsersInvitedStatus;
    if (id != UsersInvitedID) {
        ws.WebSocket_Send(api.USER_INVITE_Request_ID + UsersInvitedID);
    }
}
let TableInvites = new TableUser("user-table-invite", Invite_Table_Select);
export function Invite_Table_Update(text) {
    TableInvites.update(JSON.parse(text));
}
function Invite_Table_Select(event) {
    TableInvites.select(event);
    document.getElementById("invite-button-accept").disabled = (TableInvites.selected_idx == -1);
}
function Invite_Invite() {
    Invite_Set(TableOnline.selected_idx);
}
function Invite_Cancel() {
    Invite_Set(-1);
}
function Invite_Accept() {
    if (TableInvites.selected_idx != -1) {
        ws.WebSocket_Send(api.USER_INVITE_Accept_ID + TableInvites.selected_id);
    }
}
document.getElementById("invite-button-invite").onclick = Invite_Invite;
document.getElementById("invite-button-cancel").onclick = Invite_Cancel;
document.getElementById("invite-button-accept").onclick = Invite_Accept;
