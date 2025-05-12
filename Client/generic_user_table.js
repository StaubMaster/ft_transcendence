
export function clear(table)
{
	var rows = table.rows;
	while (rows.length > 1)
	{
		table.deleteRow(1);
	}
}

export function show(table, table_JSON, onClickFuncName)
{
	var data = JSON.parse(table_JSON);
	for (var i = 0; i < data.length; i++)
	{
		var row = table.insertRow(i + 1);
		row.insertCell(0).textContent = data[i].ID;
		row.insertCell(1).textContent = data[i].User;
		row.insertCell(2).textContent = data[i].Status;

		var func = new Function(onClickFuncName + "(" + (i + 1) + ");");
		row.onclick = func;
	}
}

export function show_select(table, idx)
{
	var rows = table.rows;
	for (var i = 0; i < rows.length; i++)
	{
		if (i == idx)
			rows[i].style.backgroundColor = "#777777";
		else if (i % 2 == 0)
			rows[i].style.backgroundColor = "#DDDDDD";
		else
			rows[i].style.backgroundColor = "#EEEEEE";
	}
}

export function select(table, idx)
{
	var rows = table.rows;
	var id = -1;
	for (var i = 0; i < rows.length; i++)
	{
		if (i == idx)
		{
			id = rows[i].cells[0].textContent;
			rows[i].style.backgroundColor = "#777777";
		}
		else if (i % 2 == 0)
		{
			rows[i].style.backgroundColor = "#DDDDDD";
		}
		else
		{
			rows[i].style.backgroundColor = "#EEEEEE";
		}
	}
	return [idx, id];
}

export function findID(table, id)
{
	if (id == -1) { return -1; }
	var rows = table.rows;
	for (var i = 0; i < rows.length; i++)
	{
		const cells = rows[i].cells;
		if (cells[0].textContent == id)
		{
			return i;
		}
	}
	return -1;
}

export function re_select(table, idx, id)
{
	idx = findID(table, id);
	if (idx == -1) { id = -1; }
	show_select(table, idx);
	return [idx, id];
}
