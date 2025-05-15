import * as api from './API_Const.js';
import * as ws from './WebSockert.js';
import * as userTable from './generic_user_table.js';
var UsersSelectedIndex = -1;
var UsersSelectedID = -1;
export function Online_Table_Update(json) {
    let table = document.getElementById("user-table-online");
    userTable.clear(table);
    userTable.show(table, json, Online_Table_Select);
    [UsersSelectedIndex, UsersSelectedID] = userTable.re_select(table, UsersSelectedIndex, UsersSelectedID);
    let idx = userTable.findID(table, UsersInvitedID);
    Invite_Set(idx);
}
function Online_Table_Select(ev) {
    let idx = userTable.MouseEventToRowIndex(ev);
    let table = document.getElementById("user-table-online");
    userTable.show_select(table, idx);
    [UsersSelectedIndex, UsersSelectedID] = userTable.select_idx_id(table, idx);
    document.getElementById("invite-button-invite").disabled = (idx == -1);
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
        let table = document.getElementById("user-table-online");
        UsersInvitedID = Number.parseInt(table.rows[idx].cells[0].textContent);
        UsersInvitedName = table.rows[idx].cells[1].textContent;
        UsersInvitedStatus = table.rows[idx].cells[2].textContent;
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
var InviteSelectedIndex = -1;
var InviteSelectedID = -1;
export function Invite_Table_Update(text) {
    let table = document.getElementById("user-table-invite");
    userTable.clear(table);
    userTable.show(table, JSON.parse(text), Invite_Table_Select);
    [InviteSelectedIndex, InviteSelectedID] = userTable.re_select(table, InviteSelectedIndex, InviteSelectedID);
}
function Invite_Table_Select(ev) {
    let idx = userTable.MouseEventToRowIndex(ev);
    let table = document.getElementById("user-table-invite");
    [InviteSelectedIndex, InviteSelectedID] = userTable.select_idx_id(table, idx);
    document.getElementById("invite-button-accept").disabled = (idx == -1);
}
function Invite_Invite() {
    Invite_Set(UsersSelectedIndex);
}
function Invite_Cancel() {
    Invite_Set(-1);
}
function Invite_Accept() {
    if (InviteSelectedIndex != -1) {
        ws.WebSocket_Send(api.USER_INVITE_Accept_ID + InviteSelectedID);
    }
}
document.getElementById("invite-button-invite").onclick = Invite_Invite;
document.getElementById("invite-button-cancel").onclick = Invite_Cancel;
document.getElementById("invite-button-accept").onclick = Invite_Accept;
