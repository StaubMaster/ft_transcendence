<?php

echo "hellp World?\n";

error_reporting(E_ALL);
ob_implicit_flush();

include 'socket_help.php';
include 'WebSocket.php';
include 'TimeCheck.php';
include 'PongMatch.php';


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


$tickTimeCheck = new TimeCheck(1);


$webSocket0 = null;
$webSocket1 = null;
$websocketArr = array();
$pongMatch = null;

echo "loop\n";
do
{
	if ($tickTimeCheck->check())
	{
		echo "tick\n";

		$changeArr = false;
		foreach ($websocketArr as &$ws)
		{
			if (($message = $ws->recvText()) !== false)
			{
				echo "recv ---> '$message'\n";
				$message = "no";
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
		}
	}

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
		$header = socket_client_read_header($client_socket);
		echo "header reading done\n";

		if ($header != null)
		{
			$request = explode(" ", $header, 3);
			$method = $request[0];
			$path = $request[1];

			echo "========\n";
			echo "$header";
			echo "========\n";
			//echo "method '" . $method . "'\n";
			//echo "path   '" . $path . "'\n";
			//echo "========\n";

			if ($method == "GET")
			{
				if ($path[0] == '/')
				{
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
							echo ".... File '$path' found\n";
							Respond200($client_socket, file_get_contents($path));
						}
						else
						{
							echo "!!!! File '$path' not found\n";
							Respond404($client_socket);
						}
					}
					else
					{
						echo ".... WebSocket\n";
						$websocket_accept = WebSocket::HandShake($websocket_key);
						Respond101($client_socket, $websocket_accept);

						$ws = new WebSocket($client_socket);
						$client_socket = null;
						array_push($websocketArr, $ws);
					}
				}
				else
				{
					echo "!!!! Not File/Dir '$path'\n";
					Respond400($client_socket);
				}
			}
			else
			{
				echo "!!!! Unknown Method '$method'\n";
				Respond400($client_socket);
			}
		}
		else
		{
			echo "!!!! bad header read\n";
			Respond400($client_socket);
		}
	}

	if ($client_socket != null)
	{
		echo "socket_close()\n";
		socket_close($client_socket);
	}

	if ($webSocket0 != null && $webSocket1 != null)
	{
		$pongMatch = new PongMatch($webSocket0, $webSocket1);
	}

	if ($pongMatch != null)
	{
	
	}

} while (true);

socket_close($server_socket);

?>
