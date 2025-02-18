<?php

echo "hellp World?\n";

error_reporting(E_ALL);
ob_implicit_flush();

include 'socket_help.php';
include 'WebSocket.php';



/*function WebSocket_recv($fsocket)
{
	if (($buf = socket_read($fsocket, 2, PHP_BINARY_READ)) === false)
	{
		echo "socket_read(): " . socket_strerror(socket_last_error($fsocket)) . "\n";
	}

	$byte = ord($buf[0]);
	$fin  = $byte & 0b10000000;
	$rsv  = $byte & 0b01110000;
	$code = $byte & 0b00001111;
	//echo "fin  '$fin'\n";
	//echo "rsv  '$rsv'\n";
	//echo "code '$code'\n";

	$byte = ord($buf[1]);
	$mask_bit    = $byte & 0b10000000;
	$payload_len = $byte & 0b01111111;
	//echo "mask_bit    '$mask_bit'\n";
	//echo "payload_len '$payload_len'\n";

	if ($payload_len == 126)
	{
		if (($buf = socket_read($fsocket, 2, PHP_BINARY_READ)) === false)
		{
			echo "Len16\n";
			echo "socket_read(): " . socket_strerror(socket_last_error($fsocket)) . "\n";
		}

		$payload_len = 0;
		for ($i = 0; $i < 2; $i++)
		{
			$byte = ord($buf[$i]);
			echo "[$i] '$byte'\n";
			$payload_len = ($payload_len << 8) | $byte;
		}
		//echo "payload_len '$payload_len'\n";
	}
	elseif ($payload_len == 127)
	{
		if (($buf = socket_read($fsocket, 8, PHP_BINARY_READ)) === false)
		{
			echo "Len64\n";
			echo "socket_read(): " . socket_strerror(socket_last_error($fsocket)) . "\n";
		}

		$payload_len = 0;
		for ($i = 0; $i < 8; $i++)
		{
			$byte = ord($buf[$i]);
			$payload_len = ($payload_len << 8) | $byte;
		}
		//echo "payload_len '$payload_len'\n";
	}

	if (($buf = socket_read($fsocket, 4, PHP_BINARY_READ)) === false)
	{
		echo "Mask\n";
		echo "socket_read(): " . socket_strerror(socket_last_error($fsocket)) . "\n";
	}
	
	$mask_arr = array(0, 0, 0, 0);
	for ($i = 0; $i < 4; $i++)
	{
		$mask_arr[$i] = ord($buf[$i]);
	}

	if (($buf = socket_read($fsocket, $payload_len, PHP_BINARY_READ)) === false)
	{
		echo "payload\n";
		echo "socket_read(): " . socket_strerror(socket_last_error($fsocket)) . "\n";
	}

	for ($i = 0; $i < $payload_len; $i++)
	{
		$byte = ord($buf[$i]);
		$byte = ($byte ^ $mask_arr[$i % 4]);
		$buf[$i] = chr($byte);
	}

	return $buf;
}*/
/*function WebSocket_send($foscket, $payload)
{
	$payload_len = strlen($payload);
	$str = "";

	$byte = 0b10000000 | 0x1;
	$str .= chr($byte);

	$byte = $payload_len;
	$str .= chr($byte);

	$str .= $payload;

	socket_write($foscket, $str);
}*/


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
				$websocket_accept = WebSocket::HandShake($websocket_key);
				Respond101($client_socket, $websocket_accept);

				if (socket_set_block($client_socket) === false)
				{
					echo "socket_set_block(): " . socket_strerror(socket_last_error($client_socket)) . "\n";
				}

				$ws = new WebSocket($client_socket);

				$message = $ws->recv();
				echo "---> '$message'\n";

				$message = "hiiiiiiiiii :]";
				echo "<--- '$message'\n";
				$ws->send($message);
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
