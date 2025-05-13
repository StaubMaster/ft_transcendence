
export function clear(table)
{
	var rows = table.rows;
	while (rows.length > 1)
	{
		table.deleteRow(1);
	}
}

export function show(table, table_JSON)
{
	var data = JSON.parse(table_JSON);
	for (var i = 0; i < data.length; i++)
	{
		var row = table.insertRow(i + 1);

		row.insertCell(0).textContent = data[i].ID;
		row.insertCell(1).textContent = data[i].EndReason;
		row.insertCell(2).textContent = data[i].Winner;
		row.insertCell(3).textContent = data[i].Tour_ID;

		row.insertCell(4).textContent = data[i].L_ID;
		row.insertCell(5).textContent = data[i].L_Score;
		row.insertCell(6).textContent = data[i].L_EndState;

		row.insertCell(7).textContent = data[i].R_ID;
		row.insertCell(8).textContent = data[i].R_Score;
		row.insertCell(9).textContent = data[i].L_EndState;
	}
}
