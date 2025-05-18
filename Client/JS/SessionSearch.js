import * as api from './API_Const.js';
import * as ws from './WebSockert.js';
import { TableSession } from './TableSession.js';
const search_id_input = document.getElementById("1v1-search-id-input");
const search_only_valid = document.getElementById("1v1-search-only-valid");
const search_only_other = document.getElementById("1v1-search-only-other");
const search_button = document.getElementById("1v1-search-button");
let TableBrowse = new TableSession("1v1-search-table", Browse_Table_Select);
export function Browse_Table_Update(text) {
    TableBrowse.update(JSON.parse(text));
}
function Browse_Table_Select(event) {
    TableBrowse.select(event);
    Detail_Search(TableBrowse.selected_id);
}
export function Search() {
    Detail_None();
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
const detail_id = document.getElementById("1v1-search-detail-id");
const detail_reason = document.getElementById("1v1-search-detail-reason");
const detail_winner = document.getElementById("1v1-search-detail-winner");
const detail_l_user = document.getElementById("1v1-search-detail-l-user");
const detail_l_state = document.getElementById("1v1-search-detail-l-state");
const detail_l_score = document.getElementById("1v1-search-detail-l-score");
const detail_r_user = document.getElementById("1v1-search-detail-r-user");
const detail_r_state = document.getElementById("1v1-search-detail-r-state");
const detail_r_score = document.getElementById("1v1-search-detail-r-score");
function Detail_Search(id) {
    if (id == -1) {
        return;
    }
    ws.WebSocket_Send(api.SEARCH_SESSION_TABLE + id.toString());
}
function Detail_None() {
    detail_id.textContent = "";
    detail_reason.textContent = "";
    detail_winner.textContent = "";
    detail_l_user.textContent = "";
    detail_l_state.textContent = "";
    detail_l_score.textContent = "";
    detail_r_user.textContent = "";
    detail_r_state.textContent = "";
    detail_r_score.textContent = "";
}
export function Detail_Update(text) {
    const data = JSON.parse(text);
    detail_id.textContent = data.ID;
    detail_reason.textContent = data.EndReason;
    detail_winner.textContent = data.Winner;
    detail_l_user.textContent = "";
    detail_l_state.textContent = "";
    detail_l_score.textContent = "";
    detail_r_user.textContent = "";
    detail_r_state.textContent = "";
    detail_r_score.textContent = "";
}
