import * as api from './API_Const.js';
import * as main from './main.js';
import * as logIO from './logIO.js';
import * as invite from './SessionInvite.js';
import * as session from './Session.js';
import * as NavSec from './NavigationSections.js';
import * as SearchSes from './SessionSearch.js';
var ws = null;
WebSocket_Connect();
export function WebSocket_Connect() {
    if (ws != null) {
        return;
    }
    ws = new WebSocket("wss");
    ws.binaryType = "arraybuffer";
    ws.onerror = function (e) {
        console.log("socket error: ", e);
    };
    ws.onclose = function (e) {
        console.log("socket closed:" + e.code + ":" + e.reason);
        ws = null;
        //NavSec.Sections_Main_Hide();
        //NavSec.Bar_Main_Hide();
        NavSec.BarMain.Sections_Hide();
        NavSec.BarMain.Hide();
        main.MainDefault_ServerError();
        document.getElementById("game-section").style.display = "none";
    };
    ws.onopen = function () {
        logIO.AccountChangeLogOut();
        invite.Invite_Set(-1);
        //NavSec.Bar_Main_Hide();
        NavSec.BarMain.Hide();
        main.MainDefault_Reset();
    };
    ws.onmessage = function (e) {
        WebSocket_Message(e.data);
    };
}
export function WebSocket_Send(text) {
    if (ws == null) {
        console.log("WebSocket_Send(): not connected");
        console.log("'", text, "'");
        return;
    }
    else {
        //console.log("'", text, "'");
        ws.send(text);
    }
}
function WebSocket_Message(text) {
    const message_to_func = [
        [api.USER_ACCOUNT_LOGIN, logIO.AccountChangeLogIn],
        [api.USER_ACCOUNT_LOGOUT, logIO.AccountChangeLogOut],
        [api.SESSION_Start, session.Start],
        [api.SESSION_End, session.End],
    ];
    for (var i = 0; i < message_to_func.length; i++) {
        var header = message_to_func[i][0];
        var func = message_to_func[i][1];
        if (text.startsWith(header)) {
            func();
            return;
        }
    }
    const message_to_func_value = [
        [api.ALL_USERS_Table, main.UserTable_Online_Update],
        [api.USER_ACCOUNT_LOG_INFO, logIO.AccountChangeInfo],
        [api.USER_INVITE_Table, invite.Invite_Table_Update],
        [api.SEARCH_SESSION_TABLE, SearchSes.Browse_Table_Update],
        [api.SEARCH_SESSION_DETAIL, SearchSes.Detail_Update],
        ["Simulation-Data: ", session.DataChange],
    ];
    for (var i = 0; i < message_to_func_value.length; i++) {
        var header = message_to_func_value[i][0];
        var func = message_to_func_value[i][1];
        if (text.startsWith(header)) {
            const value = text.substring(header.length);
            func(value);
            return;
        }
    }
    const message_to_element = [
        [api.USER_ACCOUNT_ID, "account-id"],
        [api.USER_ACCOUNT_Name, "account-name"],
        [api.SESSION_State, "session-state"],
        [api.SESSION_L_ID, "session-L-ID"],
        [api.SESSION_L_Name, "session-L-name"],
        [api.SESSION_L_Score, "session-L-score"],
        [api.SESSION_L_State, "session-L-state"],
        [api.SESSION_R_ID, "session-R-ID"],
        [api.SESSION_R_Name, "session-R-name"],
        [api.SESSION_R_Score, "session-R-score"],
        [api.SESSION_R_State, "session-R-state"],
    ];
    for (var i = 0; i < message_to_element.length; i++) {
        var header = message_to_element[i][0];
        var element = message_to_element[i][1];
        if (text.startsWith(header)) {
            var cut = text.substring(header.length);
            var elem = document.getElementById(element);
            if (elem == null) {
                console.log("element '" + element + "' not found");
                return;
            }
            elem.textContent = cut;
            return;
        }
    }
    console.log("unrecognized message '" + text + "'");
}
