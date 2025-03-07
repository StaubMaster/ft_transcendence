<?php

echo "hellp World?\n";

error_reporting(E_ALL);
ob_implicit_flush();

echo "<<<<\n";
include 'Log.php';

include 'php8_str.php';
include 'socket_help.php';
include 'TLS.php';

include 'HTTP_Respond.php';
include 'TimeCheck.php';
include 'TimeCountDown.php';

include 'WebSocket.php';
include 'User.php';
include 'UsersArray.php';
include 'Command.php';

include 'Session/SessionPong.php';
include 'Session/SessionPongArray.php';
include 'Session/PresanceCheck.php';

include 'Simulation/Point.php';
include 'Simulation/Box.php';
include 'Simulation/VelBox.php';
include 'Simulation/Paddle.php';
include 'Simulation/SimulationPong.php';
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
	}
}

$timeStart = hrtime(true);

while (true)
{
	if (($server_socket = socket_server_create('127.0.0.1', 5000)) === false)
	//if (($server_socket = socket_server_create('192.168.0.208', 10000)) === false)	//	IP for LAN at home, dosent
	{
		$timeSec = round((hrtime(true) - $timeStart) / 1000000000);
		echo "${timeSec}s\n";
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


//	ticks are slow for debugging
//$tickTimeCheck = new TimeCheck(1);
//$tickTimeCheck = new TimeCheck(0.1);
$tickTimeCheck = new TimeCheck(0);

Log::NewFile();

echo "loop\n";
do
{
	if (($client_socket = socket_server_accept($server_socket)) === false)
	{
		echo "socket_server_accept(): " . socket_strerror(socket_last_error($server_socket)) . "\n";
		break;
	}

	if ($client_socket != null)
	{
		//echo "====    ====    ====    ====\n";
		//if (!socket_getpeername($client_socket, $addr, $port)) { echo "ERR\n"; }
		//echo "addr '$addr' port '$port'\n";

		test_TLS($client_socket);
		break;

		$header = socket_client_read_header($client_socket);
		//echo "header reading done\n";

		if ($header != null)
		{
			$request = explode(" ", $header, 3);
			$method = $request[0];
			$path = $request[1];

			if ($method == "GET")
			{
				Log::ToFile("GET $path\n");

				if (($websocket_key = HeaderFindValue($header, "Sec-WebSocket-Key: ")) !== false)
				{
					echo ".... WebSocket\n";
					$websocket_accept = WebSocket::HandShake($websocket_key);
					Respond101($client_socket, $websocket_accept);
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
						$referer = HeaderFindValue($header, "Referer: ");
						if ($referer == null)
						{
							$index_extention = ".html";
						}
						else
						{
							$pos = strrpos($referer, ".");
							$index_extention = substr($referer, $pos);
						}
						$path .= "index" . $index_extention;
					}
					$path = "Client" . $path;

					/*if (str_ends_with($path, "/core/"))
					{
						echo "... Module\n";
						$path = $path . "/index.js";
						$type = "text/javascript";
						echo "path: $path\n";
						echo "type: $type\n";
						Respond200($client_socket, $type, file_get_contents($path));
					}*/
					if (file_exists($path))
					{
						//echo ".... File '$path' found 200\n";
						$type = null;
						if (str_ends_with($path, ".html")) { $type = "text/html"; }
						if (str_ends_with($path, ".js")) { $type = "text/javascript"; }
						//echo "type: $type\n";
						Respond200File($client_socket, $type, $path);
					}
					else { echo "!!!! File '$path' not found 404\n"; Respond404($client_socket); }
				}
			}
			else { echo "!!!! Unknown Method '$method' 400\n"; Respond400($client_socket); }
		}
		else { echo "!!!! bad header read 500\n"; Respond500($client_socket); }
	}

	if ($client_socket != null)
	{
		//echo "socket_close()\n";
		socket_close($client_socket);
	}

	if ($tickTimeCheck->check())
	{
		//$timeSec = round((hrtime(true) - $timeStart) / 1000000000);
		//echo "tick " . $timeSec . "s [" . count($UsersArray) . "] [" . count($SessionPongArray) . "]\n";

		UsersArray_Update();
		SessionPongArray_Update();
	}

} while (true);

socket_close($server_socket);

?>
