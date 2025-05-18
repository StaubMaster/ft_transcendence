export class TableUser {
    constructor(table_id, onClickFunc) {
        this.table = document.getElementById(table_id);
        this.onClickFunc = onClickFunc;
        this.selected_idx = -1;
        this.selected_id = -1;
    }
    clear() {
        while (this.table.tBodies[0].rows.length > 0) {
            this.table.tBodies[0].deleteRow(0);
        }
    }
    show(json) {
        const tbody = this.table.tBodies[0];
        for (let i = 0; i < json.length; i++) {
            let row = tbody.insertRow(i);
            row.id = i.toString();
            let cell0 = row.insertCell(0);
            let cell1 = row.insertCell(1);
            let cell2 = row.insertCell(2);
            cell0.className = "w-1/5";
            cell1.className = "w-2/5";
            cell2.className = "w-2/5";
            cell0.textContent = json[i].ID;
            cell1.textContent = json[i].User;
            cell2.textContent = json[i].Status;
            row.onclick = this.onClickFunc;
        }
    }
    show_select() {
        let rows = this.table.tBodies[0].rows;
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            row.className = row.className.replace(" selected", "");
            if (i == this.selected_idx) {
                row.className += " selected";
            }
        }
    }
    select_idx_id() {
        this.selected_id = -1;
        let rows = this.table.tBodies[0].rows;
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            row.className = row.className.replace(" selected", "");
            if (i == this.selected_idx) {
                row.className += " selected";
                this.selected_id = Number.parseInt(row.cells[0].textContent);
            }
        }
    }
    findID(id) {
        if (id == -1) {
            return -1;
        }
        var rows = this.table.tBodies[0].rows;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].cells[0].textContent == id.toString()) {
                return i;
            }
        }
        return -1;
    }
    re_select_id() {
        this.selected_idx = this.findID(this.selected_id);
        if (this.selected_idx == -1) {
            this.selected_id = -1;
        }
        this.show_select();
    }
    update(json) {
        this.clear();
        this.show(json);
        this.re_select_id();
    }
    select(event) {
        this.selected_idx = TableUser.MouseEventToRowIndex(event);
        this.select_idx_id();
    }
    static MouseEventToRowIndex(event) {
        let cell = event.target;
        let row = cell.parentElement;
        let idx = Number.parseInt(row.id);
        return idx;
    }
}
