<?php

echo "hellp World?\n";

error_reporting(E_ALL);
ob_implicit_flush();

echo "<<<<\n";
include 'socket_help.php';
include 'TimeCheck.php';

include 'WebSocket.php';
include 'User.php';
include 'UsersArray.php';
include 'Command.php';

include 'Session/SessionPong.php';

include 'Simulation/Point.php';
include 'Simulation/Box.php';
include 'Simulation/VelBox.php';
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

/*$UserArr = array();
function PlayersUpdate()
{
	global $UserArr;
	$changeArr = false;
	foreach ($UserArr as &$pl)
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
	global $UserArr;
	$newArr = array();
	foreach ($UserArr as &$pl)
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
	$UserArr = $newArr;
}
function PlayersAdd($fsocket)
{
	echo "++++ Player ++++\n";
	global $UserArr;
	$new_pl = new CPlayer(new WebSocket($fsocket));
	array_push($UserArr, $new_pl);
	$client_socket = null;
}
function PlayersGetID($id)
{
	global $UserArr;
	foreach ($UserArr as &$pl)
	{
		if ($pl->getID() == $id)
		{
			return $pl;
		}
	}
	return null;
}*/

$SessionPongArr = array();
function SessionPongUpdate()
{
	global $SessionPongArr;
	$changeArr = false;
	foreach ($SessionPongArr as &$pm)
	{
		$pm->Update();
		if ($pm->isGameOver())
		{
			$changeArr = true;
		}
	}
	if ($changeArr)
	{
		SessionPongTrim();
	}
}
function SessionPongTrim()
{
	global $SessionPongArr;
	$newArr = array();
	foreach ($SessionPongArr as &$pm)
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
	$SessionPongArr = $newArr;
}
function SessionPongAdd($usrL, $usrR)
{
	echo "++++ pong Match ++++\n";
	global $SessionPongArr;
	$new_pm = new SessionPong($usrL, $usrR);
	$new_pm->PresentCheckWait();
	array_push($SessionPongArr, $new_pm);
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
		echo "====    ====    ====    ====\n";
		/*if (!socket_getpeername($client_socket, $addr, $port)) { echo "ERR\n"; }
		echo "addr '$addr' port '$port'\n";*/
		$header = socket_client_read_header($client_socket);
		echo "header reading done\n";

		if ($header != null)
		{
			$request = explode(" ", $header, 3);
			$method = $request[0];
			$path = $request[1];

			if ($method == "GET")
			{
				echo "GET '" . $path . "'\n";

				if (($websocket_key = HeaderFindValue($header, "Sec-WebSocket-Key: ")) !== false)
				{
					echo ".... WebSocket\n";
					$websocket_accept = WebSocket::HandShake($websocket_key);
					Respond101($client_socket, $websocket_accept);
					//PlayersAdd($client_socket);
					UsersArray_AddBySocket($client_socket);
					$client_socket = null;
				}
				else if (str_starts_with($path, "/BrowseUsersTable"))
				{
					echo ".... BrowserUserTable\n";
					$id = -1;
					if (($pos = strpos($path, "%")) !== false)
					{
						$id = substr($path, $pos + 1);
					}
					Respond200($client_socket, "text/html", UsersArray_BrowseTable($id));
				}
				else
				{
					if ($path[-1] == "/")
					{
						$path = $path . "index.html";
					}
					$path = "Client" . $path;
					echo "path '$path'\n";

					if (file_exists($path))
					{
						echo ".... File '$path' found 200\n";
						$type = null;
						if (str_ends_with($path, ".html")) { $type = "text/html"; }
						if (str_ends_with($path, ".js")) { $type = "text/javascript"; }
						if (str_contains($path, "@babylon")) { $type = "text/javascript"; }
						Respond200($client_socket, $type, file_get_contents($path));
					}
					else { echo "!!!! File '$path' not found 404\n"; Respond404($client_socket); }
				}

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
		//echo "tick " . $timeSec . "s [" . count($UserArr) . "] [" . count($SessionPongArr) . "]\n";
		echo "tick " . $timeSec . "s [" . count($UsersArray) . "] [" . count($SessionPongArr) . "]\n";

		//PlayersUpdate();
		UsersArray_Update();
		SessionPongUpdate();
	}

} while (true);

socket_close($server_socket);

?>
