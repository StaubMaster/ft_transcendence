
<?php

$UsersArray = array();

function UsersArray_Update()
{
	global $UsersArray;
	$changeArr = false;
	foreach ($UsersArray as &$usr)
	{
		$usr->Update();
		if ($usr->isRemove())
		{
			$changeArr = true;
		}
	}
	if ($changeArr)
	{
		UsersArray_Trim();
	}
}
function UsersArray_Trim()
{
	global $UsersArray;
	$newArr = array();
	foreach ($UsersArray as &$usr)
	{
		if (!$usr->isRemove())
		{
			array_push($newArr, $usr);
		}
		else
		{
			echo "---- User ----\n";
		}
	}
	$UsersArray = $newArr;
}
function UsersArray_AddBySocket($fsocket)
{
	echo "++++ User ++++\n";
	global $UsersArray;
	$new_pl = new User(new WebSocket($fsocket));
	array_push($UsersArray, $new_pl);
	$client_socket = null;
}

function UsersArray_GetByID($id)
{
	global $UsersArray;
	foreach ($UsersArray as &$usr)
	{
		if ($usr->getID() == $id)
		{
			return $usr;
		}
	}
	return null;
}

function UsersArray_BrowseTable($id)
{
	global $UsersArray;
	$table = '[';
	for ($i = 0; $i < count($UsersArray); $i++)
	{
		if ($i != 0) { $table .= ','; }
		$table .= $UsersArray[$i]->getTableUser($id);
	}
	$table .= ']';
	return $table;
}

?>
