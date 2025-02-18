
<?php

function socket_server_create($faddress, $fport)
{
	//echo "socket_create()\n";
	if (($fserver_socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false)
	{
		echo "socket_create(): " . socket_strerror(socket_last_error()) . "\n";
		return false;
	}

	//echo "socket_bind()\n";
	if (socket_set_nonblock($fserver_socket) === false)
	{
		echo "socket_set_nonblock(): " . socket_strerror(socket_last_error($fserver_socket)) . "\n";
		return false;
	}

	//echo "socket_bind()\n";
	if (socket_bind($fserver_socket, $faddress, $fport) === false)
	{
		echo "socket_bind(): " . socket_strerror(socket_last_error($fserver_socket)) . "\n";
		return false;
	}

	//echo "socket_listen()\n";
	if (socket_listen($fserver_socket, 5) === false)
	{
		echo "socket_listen(): " . socket_strerror(socket_last_error($fserver_socket)) . "\n";
		return false;
	}

	return $fserver_socket;
}

function socket_server_accept($fserver_socket)
{
	if (($fclient_socket = socket_accept($fserver_socket)) === false)
	{
		$err_code = socket_last_error($fserver_socket);
		if ($err_code != 0)
		{
			echo "socket_accept(): " . socket_strerror($err_code) . "\n";
			return false;
		}
		return null;
	}
	return $fclient_socket;
}

function socket_client_read_header($fclient_socket)
{
	//echo "loop <--\n";
	$msg = "";
	do
	{
		if (($buf = socket_read($fclient_socket, 256, PHP_NORMAL_READ)) === false)
		{
			echo "socket_read(): " . socket_strerror(socket_last_error($fclient_socket)) . "\n";
			break;
		}

		if ($buf == "")
		{
			//echo "END of Message\n";
			break;
		}
		$msg = $msg . $buf;

		//echo "<<<<<<<<$buf>>>>>>>>\n";

		if (strlen($msg) > 4)
		{
			$last4 = substr($msg, strlen($msg) - 4);
			if ($last4 == "\r\n\r\n")
			{
				//echo "end of Header\n";
				break;
			}
		}
	} while (true);
	//echo "loop -->\n";
	return $msg;
}

/*function ResponseCodeToString($fcode)
{
	if ($fcode == 200) { return "OK"; }
	if ($fcode == 400) { return "Bad Request"; }
	if ($fcode == 404) { return "Not Found"; }
	return "Unknown";
}*/
function Respond101($fsocket, $faccept)
{
	socket_write($fsocket, "HTTP/1.1 101 Switching Protocols\r\n");
	socket_write($fsocket, "Upgrade: websocket\r\n");
	socket_write($fsocket, "Connection: Upgrade\r\n");
	socket_write($fsocket, "Sec-WebSocket-Accept: $faccept\r\n");
	socket_write($fsocket, "\r\n");
}
function Respond200($fsocket, $fbody)
{
	socket_write($fsocket, "HTTP/1.1 200 OK\r\n");
	socket_write($fsocket, "\r\n");
	socket_write($fsocket, $fbody);
}
function Respond400($fsocket)
{
	socket_write($fsocket, "HTTP/1.1 400 Bad Request\r\n");
	socket_write($fsocket, "\r\n");
}
function Respond404($fsocket)
{
	socket_write($fsocket, "HTTP/1.1 404 Not Found\r\n");
	socket_write($fsocket, "\r\n");
}

?>
