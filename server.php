<?php

echo "hellp World?\n";

error_reporting(E_ALL);
ob_implicit_flush();

$address = '127.0.0.1';
$port = 5000;

echo "socket_create()\n";
if (($server_socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false)
{
	echo "socket_create(): " . socket_strerror(socket_last_error()) . "\n";
}

echo "socket_bind()\n";
if (socket_bind($server_socket, $address, $port) === false)
{
	echo "socket_bind(): " . socket_strerror(socket_last_error($server_socket)) . "\n";
}

echo "socket_listen()\n";
if (socket_listen($server_socket, 5) === false)
{
	echo "socket_listen(): " . socket_strerror(socket_last_error($server_socket)) . "\n";
}

echo "loop\n";
do
{
	echo "socket_accept()\n";
	if (($client_socket = socket_accept($server_socket)) === false)
	{
		echo "socket_accept(): " . socket_strerror(socket_last_error($server_socket)) . "\n";
		break;
	}

	echo "loop <--\n";
	$msg = "";
	do
	{
		if (($buf = socket_read($client_socket, 256, PHP_NORMAL_READ)) === false)
		{
			echo "socket_read(): " . socket_strerror(socket_last_error($client_socket)) . "\n";
			break;
		}

		if ($buf == "")
		{
			echo "END of Message\n";
			break;
		}
		$msg = $msg . $buf;

		if (strlen($msg) > 4)
		{
			$last4 = substr($msg, strlen($msg) - 4);
			if ($last4 == "\r\n\r\n")
			{
				echo "end of Header\n";
				break;
			}
		}
	} while (true);
	echo "loop -->\n";

	$request = explode(" ", $msg, 3);
	$method = $request[0];
	$path = $request[1];

	echo "========\n";
	echo "$msg";
	echo "========\n";
	echo "method '" . $method . "'\n";
	echo "path   '" . $path . "'\n";
	echo "========\n";

	if ($method == "GET")
	{
		if ($path[0] == '/')
		{
			if ($path[-1] == '/')
			{
				$path = $path . "index.html";
			}
			$path = substr($path, 1, strlen($path) - 1);
			echo "path '$path'\n";

			if (file_exists($path))
			{
				$header = "";
				$header .= "HTTP/1.1 200 OK\r\n";
				$header .= "\r\n";
				socket_write($client_socket, $header);
				$file = file_get_contents($path);
				socket_write($client_socket, $file);
			}
			else
			{
				echo "File '$path' not found\n";
				$header = "";
				$header .= "HTTP/1.1 404 Not Found\r\n";
				$header .= "\r\n";
				socket_write($client_socket, $header);
			}
		}
		else
		{
			echo "Not File/Dir '$path'\n";
			$header = "";
			$header .= "HTTP/1.1 400 Bad Request\r\n";
			$header .= "\r\n";
			socket_write($client_socket, $header);
		}
	}
	else
	{
		echo "Unknown Method '$method'\n";
		$header = "";
		$header .= "HTTP/1.1 400 Bad Request\r\n";
		$header .= "\r\n";
		socket_write($client_socket, $header);
	}

	echo "socket_close()\n";
	socket_close($client_socket);
} while (true);

socket_close($server_socket);

?>
