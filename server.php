<?php

echo "hellp World?\n";

error_reporting(E_ALL);
ob_implicit_flush();

include 'socket_help.php';


function WebSocket_HandShake($fkey)
{
	$faccept = $fkey . "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
	$faccept = sha1($faccept, true);
	$faccept = base64_encode($faccept);
	return $faccept;
}


if (($server_socket = socket_server_create('127.0.0.1', 5000)) === false)
{
	while (true) { }
}

echo "loop\n";
do
{
	if (($client_socket = socket_server_accept($server_socket)) === false)
	{
		echo "socket_server_accept(): " . socket_strerror(socket_last_error($server_socket)) . "\n";
		break;
	}

	if ($client_socket == null)
	{
		continue;
	}

	$msg = socket_client_read_header($client_socket);

	$request = explode(" ", $msg, 3);
	$method = $request[0];
	$path = $request[1];
	$websocket_key = null;
	if (($websocket_key = strpos($msg, "Sec-WebSocket-Key: ")) === false)
	{
		$websocket_key = null;
	}
	else
	{
		$a = strpos($msg, " ", $websocket_key) + 1;
		$b = strpos($msg, "\r\n", $websocket_key);
		$websocket_key = substr($msg, $a, $b - $a);
		//echo "key '$websocket_key' " . strlen($websocket_key) . "\n";
	}

	//echo "========\n";
	//echo "$msg";
	//echo "========\n";
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

			if ($websocket_key == null)
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
				$websocket_accept = WebSocket_HandShake($websocket_key);
				echo "accelt '$websocket_accept'\n";
				Respond101($client_socket, $websocket_accept);

				
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

	echo "socket_close()\n";
	socket_close($client_socket);
} while (true);

socket_close($server_socket);

?>
