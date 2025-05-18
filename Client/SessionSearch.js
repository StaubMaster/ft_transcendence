import * as api from './API_Const.js';
import * as ws from './WebSockert.js';
import { TableSession } from './TableSession.js';
const search_id_input = document.getElementById("1v1-search-id-input");
const search_only_valid = document.getElementById("1v1-search-only-valid");
const search_only_other = document.getElementById("1v1-search-only-other");
const search_button = document.getElementById("1v1-search-button");
let TableBrowse = new TableSession("session-search-table", Browse_Table_Select);
export function Browse_Table_Update(text) {
    TableBrowse.update(JSON.parse(text));
}
function Browse_Table_Select(event) {
    TableBrowse.select(event);
}
export function Search() {
    if (search_id_input.value == "") {
        return;
    }
    let id = search_id_input.value;
    let data = {
        ID: id,
        OnlyValid: search_only_valid.checked,
        OnlyOther: search_only_other.checked,
    };
    ws.WebSocket_Send(api.SEARCH_SESSION_TABLE + JSON.stringify(data));
}
search_button.onclick = Search;
