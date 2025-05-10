
function user_table_clear(table_ID)
{
	var table = document.getElementById(table_ID);
	var rows = table.rows;
	while (rows.length > 1)
	{
		table.deleteRow(1);
	}
}

function user_table_list(table_ID, table_JSON, funcName)
{
	var table = document.getElementById(table_ID);

	var data = JSON.parse(table_JSON);
	for (var i = 0; i < data.length; i++)
	{
		var row = table.insertRow(i + 1);
		var cell_id = row.insertCell(0);
		var cell_user = row.insertCell(1);
		var cell_status = row.insertCell(2);

		var func = new Function(funcName + "(" + (i + 1) + ");");
		row.onclick = func;

		cell_id.textContent = data[i].ID;
		cell_user.textContent = data[i].User;
		cell_status.textContent = data[i].Status;
	}
}

function user_table_select(table_ID, idx)
{
	var table = document.getElementById(table_ID);
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
