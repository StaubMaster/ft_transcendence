
<?php

$SessionPongArray = array();

function SessionPongArray_Update()
{
	global $SessionPongArray;
	$changeArr = false;
	foreach ($SessionPongArray as &$ses)
	{
		$ses->Update();
		if ($ses->isGameOver())
		{
			$changeArr = true;
		}
	}
	if ($changeArr)
	{
		SessionPongArray_Trim();
	}
}
function SessionPongArray_Trim()
{
	global $SessionPongArray;
	$newArr = array();
	foreach ($SessionPongArray as &$ses)
	{
		if (!$ses->isGameOver())
		{
			array_push($newArr, $ses);
		}
		else
		{
			echo "---- pong Match ----\n";
			$ses->removePlayers();
			$ses = null;
		}
	}
	$SessionPongArray = $newArr;
}
function SessionPongArray_AddByUsers($usrL, $usrR)
{
	echo "++++ pong Match ++++\n";
	global $SessionPongArray;
	$new_ses = new SessionPong($usrL, $usrR);
	$new_ses->PresentCheckWait();
	array_push($SessionPongArray, $new_ses);
}

?>
