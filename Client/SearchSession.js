import * as api from './API_Const.js';
import * as ws from './WebSockert.js';
import { TableSession } from './TableSession.js';
const search_button = document.getElementById("1v1-search-button");
const search_input = document.getElementById("1v1-search-user-field");
let TableBrowse = new TableSession("session-search-table", Browse_Table_Select);
export function Browse_Table_Update(text) {
    TableBrowse.update(JSON.parse(text));
}
function Browse_Table_Select(event) {
    TableBrowse.select(event);
}
export function Search() {
    let id = search_input.value;
    ws.WebSocket_Send(api.USER_SEARCH_ID + id);
}
search_button.onclick = Search;
