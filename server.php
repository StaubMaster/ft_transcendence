<?php

echo "hellp World?\n";

error_reporting(E_ALL);
ob_implicit_flush();

echo "<<<<\n";
include 'socket_help.php';
include 'WebSocket.php';
include 'TimeCheck.php';
include 'Player.php';

include 'Point.php';
include 'Box.php';
include 'VelBox.php';

include 'PongMatch.php';
include 'Command.php';
echo ">>>>\n";

function HeaderFindValue($fheader, $fname)
{
	if (($fvalue = strpos($fheader, $fname)) === false)
	{
		return false;
	}
	else
	{
		$a = strpos($fheader, " ", $fvalue) + 1;
		$b = strpos($fheader, "\r\n", $fvalue);
		return substr($fheader, $a, $b - $a);
		//echo "key '$websocket_key' " . strlen($websocket_key) . "\n";
	}
}


while (true)
{
	if (($server_socket = socket_server_create('127.0.0.1', 5000)) === false)
	//if (($server_socket = socket_server_create('192.168.0.208', 10000)) === false)	//	IP for LAN at home, dosent
	{
		sleep(1);
	}
	else
	{
		break;
	}
}
if (socket_set_nonblock($server_socket) === false)
{
	echo "socket_set_nonblock(): " . socket_strerror(socket_last_error($server_socket)) . "\n";
}


//	ticks are slow for debugging purposes
$tickTimeCheck = new TimeCheck(1);
$timeStart = hrtime(true);

$playerArr = array();
$pongMatchArr = array();

function PlayersUpdate()
{
	global $playerArr;
	$changeArr = false;
	foreach ($playerArr as &$pl)
	{
		$pl->Update();
		if ($pl->isRemove())
		{
			$changeArr = true;
		}
	}
	if ($changeArr)
	{
		PlayersTrim();
	}
}
function PlayersTrim()
{
	global $playerArr;
	$newArr = array();
	foreach ($playerArr as &$pl)
	{
		if (!$pl->isRemove())
		{
			array_push($newArr, $pl);
		}
		else
		{
			echo "---- Player ----\n";
		}
	}
	$playerArr = $newArr;
}
function PlayersAdd($fsocket)
{
	echo "++++ Player ++++\n";
	global $playerArr;
	$new_pl = new CPlayer(new WebSocket($fsocket));
	array_push($playerArr, $new_pl);
	$client_socket = null;
}
function PlayersGetID($id)
{
	global $playerArr;
	foreach ($playerArr as &$pl)
	{
		if ($pl->getID() == $id)
		{
			return $pl;
		}
	}
	return null;
}

function PongMatchesUpdate()
{
	global $pongMatchArr;
	$changeArr = false;
	foreach ($pongMatchArr as &$pm)
	{
		$pm->Update();
		if ($pm->isGameOver())
		{
			$changeArr = true;
		}
	}
	if ($changeArr)
	{
		PongMatchesTrim();
	}
}
function PongMatchesTrim()
{
	global $pongMatchArr;
	$newArr = array();
	foreach ($pongMatchArr as &$pm)
	{
		if (!$pm->isGameOver())
		{
			array_push($newArr, $pm);
		}
		else
		{
			echo "---- pong Match ----\n";
			$pm->removePlayers();
			$pm = null;
		}
	}
	$pongMatchArr = $newArr;
}
function PongMatchesAdd($idL, $idR)
{
	echo "++++ pong Match ++++\n";
	global $pongMatchArr;
	$new_pm = new PongMatch(PlayersGetID($idL), PlayersGetID($idR));
	$new_pm->PresentCheckWait();
	array_push($pongMatchArr, $new_pm);
}

echo "loop\n";
do
{
	//echo "here 1\n";
	if (($client_socket = socket_server_accept($server_socket)) === false)
	{
		echo "socket_server_accept(): " . socket_strerror(socket_last_error($server_socket)) . "\n";
		break;
	}
	//echo "here 2\n";

	if ($client_socket != null)
	{
		echo "incomming\n";
		/*if (!socket_getpeername($client_socket, $addr, $port)) { echo "ERR\n"; }
		echo "addr '$addr' port '$port'\n";*/
		$header = socket_client_read_header($client_socket);
		echo "header reading done\n";

		if ($header != null)
		{
			$request = explode(" ", $header, 3);
			$method = $request[0];
			$path = $request[1];

			//echo "========\n";
			//echo "$header";
			//echo "========\n";
			//echo "method '" . $method . "'\n";
			//echo "path   '" . $path . "'\n";
			//echo "========\n";

			if ($method == "GET")
			{
				if ($path[0] == '/')
				{
					echo "GET '" . $path . "'\n";
					if ($path[-1] == '/')
					{
						$path = $path . "index.html";
					}
					$path = substr($path, 1, strlen($path) - 1);
					//echo "path '$path'\n";

					if (($websocket_key = HeaderFindValue($header, "Sec-WebSocket-Key: ")) === false)
					{
						if (file_exists($path))
						{
							echo ".... File '$path' found 200\n";
							$type = null;
							if (str_ends_with($path, ".html")) { $type = "text/html"; }
							if (str_ends_with($path, ".js")) { $type = "text/javascript"; }
							if (str_contains($path, "@babylon")) { $type = "text/javascript"; }
							//Content-Type: text/html
							Respond200($client_socket, $type, file_get_contents($path));
						}
						else if (str_starts_with($path, "UserTable"))
						{
							$id = -1;
							if (($pos = strpos($path, "%")) !== false)
							{
								$id = substr($path, $pos + 1);
							}

							$table_users = '[';
							for ($i = 0; $i < count($playerArr); $i++)
							{
								if ($i != 0) { $table_users .= ','; }
								$table_users .= $playerArr[$i]->getTableUser($id);
							}
							$table_users .= ']';
							Respond200($client_socket, "text/html", $table_users);
						}
						else { echo "!!!! File '$path' not found 404\n"; Respond404($client_socket); }
					}
					else
					{
						echo ".... WebSocket\n";
						$websocket_accept = WebSocket::HandShake($websocket_key);
						Respond101($client_socket, $websocket_accept);
						PlayersAdd($client_socket);
						$client_socket = null;
					}
				}
				else { echo "!!!! Not File/Dir '$path' 400\n"; Respond400($client_socket); }
			}
			else { echo "!!!! Unknown Method '$method' 400\n"; Respond400($client_socket); }
		}
		else { echo "!!!! bad header read 400\n"; Respond400($client_socket); }
	}

	if ($client_socket != null)
	{
		echo "socket_close()\n";
		socket_close($client_socket);
	}

	if ($tickTimeCheck->check())
	{
		$timeSec = round((hrtime(true) - $timeStart) / 1000000000);
		echo "tick " . $timeSec . "s [" . count($playerArr) . "] [" . count($pongMatchArr) . "]\n";

		//$changeArr = false;
		/*foreach ($websocketArr as &$ws)
		{
			if (($message = $ws->recvText()) !== false)
			{
				echo "recv ---> '$message'\n";
				$message = "hi";
				echo "send <--- '$message'\n";
				$ws->sendText($message);
			}
			$ws->checkConnectionUpdate();
			if ($ws->isClose())
			{
				$changeArr = true;
			}
		}
		if ($changeArr)
		{
			$newArr = array();
			foreach ($websocketArr as &$ws)
			{
				if (!$ws->isClose())
				{
					echo "==== remove ====\n";
					array_push($newArr, $ws);
				}
			}
			$websocketArr = $newArr;
		}*/

		/*foreach ($playerArr as &$pl)
		{
			$pl->Update();
			if ($pl->isRemove())
			{
				$changeArr = true;
			}
			if (($invID = $pl->CheckInvite()) !== false)
			{
				$found = false;
				foreach ($playerArr as &$pl2)
				{
					if ($pl->getID() != $pl2->getID())
					{
						$pl2->RequestInvite($pl->getID());
						$found = true;
						break;
					}
				}
				if (!$found)
				{
					$pl->InviteIDNotFound();
				}
			}
		}
		if ($changeArr)
		{
			PlayersTrim();
		}*/
		PlayersUpdate();
		PongMatchesUpdate();
	}

	/*if ($pongMatch == null)
	{
		$num = count($websocketArr);
		if ($num >= 2 && !$websocketArr[$num - 1].isClose() && !$websocketArr[$num - 2].isClose())
		{
			echo "++++ pong Match ++++\n";
			$pongMatch = new PongMatch($websocketArr[$num - 1], $websocketArr[$num - 2]);
			$pongMatch->PresentCheckWait();
		}
	}
	else
	{
		$pongMatch->Update();
		//if ($pongMatch->isGameOver()) { echo "isGameOver: true\n"; } else { echo "isGameOver: false\n"; }
		if ($pongMatch->isGameOver())
		{
			echo "---- pong Match ----\n";
			$pongMatch = null;
		}
	}*/

} while (true);

socket_close($server_socket);

?>
