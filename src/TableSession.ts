
export class TableSession
{
	table: HTMLTableElement;
	onClickFunc: (event: MouseEvent) => (any);

	selected_idx: number;
	selected_id: number;

	constructor(table_id: string, onClickFunc: (event: MouseEvent) => (void))
	{
		this.table = document.getElementById(table_id) as HTMLTableElement;
		this.onClickFunc = onClickFunc;

		this.selected_idx = -1;
		this.selected_id = -1;
	}

	clear()
	{
		while (this.table.tBodies[0].rows.length > 0)
		{
			this.table.tBodies[0].deleteRow(0);
		}
	}

	show(json: any)
	{
		const tbody = this.table.tBodies[0];
		for (let i = 0; i < json.length; i++)
		{
			let row = tbody.insertRow(i);
			row.id = i.toString();

			let cell0 = row.insertCell(0);
			let cell1 = row.insertCell(1);
			let cell2 = row.insertCell(2);

			cell0.className = "w-1/6";
			cell1.className = "w-3/6";
			cell2.className = "w-2/6";

			cell0.textContent = json[i].ID;
			cell1.textContent = json[i].EndReason;
			cell2.textContent = json[i].Winner;

			row.onclick = this.onClickFunc;
		}
	}

	show_select()
	{
		let rows = this.table.tBodies[0].rows;
		for (let i = 0; i < rows.length; i++)
		{
			let row = rows[i];
			row.className = row.className.replace(" selected", "");
			if (i == this.selected_idx)
			{
				row.className += " selected";
			}
		}
	}

	select_idx_id()
	{
		this.selected_id = -1;
		let rows = this.table.tBodies[0].rows;
		for (let i = 0; i < rows.length; i++)
		{
			let row = rows[i];
			row.className = row.className.replace(" selected", "");
			if (i == this.selected_idx)
			{
				row.className += " selected";
				this.selected_id = Number.parseInt(row.cells[0].textContent as string);
			}
		}
	}

	findID(id: number)
	{
		if (id == -1)
		{
			return -1;
		}
		var rows = this.table.tBodies[0].rows;
		for (var i = 0; i < rows.length; i++)
		{
			if (rows[i].cells[0].textContent as string == id.toString())
			{
				return i;
			}
		}
		return -1;
	}

	re_select_id()
	{
		this.selected_idx = this.findID(this.selected_id);
		if (this.selected_idx == -1)
		{
			this.selected_id = -1;
		}
		this.show_select();
	}

	update(json: any)
	{
		this.clear();
		this.show(json);
		this.re_select_id();
	}
	select(event: MouseEvent)
	{
		this.selected_idx = TableSession.MouseEventToRowIndex(event);
		this.select_idx_id();
	}

	static MouseEventToRowIndex(event: MouseEvent)
	{
		let cell = event.target as HTMLElement;
		let row = cell.parentElement as HTMLTableRowElement;
		let idx = Number.parseInt(row.id);
		return idx;
	}
}
