export function clear(table) {
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
}
export function MouseEventToRowIndex(event) {
    let cell = event.target;
    let row = cell.parentElement;
    let idx = Number.parseInt(row.id);
    return idx;
}
export function show(table, json, onClickFunc) {
    for (let i = 0; i < json.length; i++) {
        let row = table.insertRow(i + 1);
        row.id = (i + 1).toString();
        row.insertCell(0).textContent = json[i].ID;
        row.insertCell(1).textContent = json[i].User;
        row.insertCell(2).textContent = json[i].Status;
        row.onclick = onClickFunc;
    }
}
export function show_select(table, idx) {
    let rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        row.className = row.className.replace(" selected", "");
        if (i == idx) {
            row.className += " selected";
        }
    }
}
export function select_idx_id(table, idx) {
    let rows = table.rows;
    let id = -1;
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        row.className = row.className.replace(" selected", "");
        if (i == idx) {
            row.className += " selected";
            id = Number.parseInt(row.cells[0].textContent);
        }
    }
    return [idx, id];
}
export function findID(table, id) {
    if (id == -1) {
        return -1;
    }
    var rows = table.rows;
    for (var i = 0; i < rows.length; i++) {
        const cells = rows[i].cells;
        if (cells[0].textContent == id.toString()) {
            return i;
        }
    }
    return -1;
}
export function re_select(table, idx, id) {
    idx = findID(table, id);
    if (idx == -1) {
        id = -1;
    }
    show_select(table, idx);
    return [idx, id];
}
